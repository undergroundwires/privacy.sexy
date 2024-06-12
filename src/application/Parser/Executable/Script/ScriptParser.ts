import type { ScriptData, CodeScriptData, CallScriptData } from '@/application/collections/';
import { NoEmptyLines } from '@/application/Parser/Executable/Script/Validation/Rules/NoEmptyLines';
import type { ILanguageSyntax } from '@/application/Parser/Executable/Script/Validation/Syntax/ILanguageSyntax';
import { CollectionScript } from '@/domain/Executables/Script/CollectionScript';
import { RecommendationLevel } from '@/domain/Executables/Script/RecommendationLevel';
import type { ScriptCode } from '@/domain/Executables/Script/Code/ScriptCode';
import type { ICodeValidator } from '@/application/Parser/Executable/Script/Validation/ICodeValidator';
import { wrapErrorWithAdditionalContext, type ErrorWithContextWrapper } from '@/application/Parser/ContextualError';
import type { ScriptCodeFactory } from '@/domain/Executables/Script/Code/ScriptCodeFactory';
import { createScriptCode } from '@/domain/Executables/Script/Code/ScriptCodeFactory';
import type { Script } from '@/domain/Executables/Script/Script';
import { createEnumParser, type IEnumParser } from '@/application/Common/Enum';
import { parseDocs, type DocsParser } from '../DocumentationParser';
import { ExecutableType } from '../Validation/ExecutableType';
import { createExecutableDataValidator, type ExecutableValidator, type ExecutableValidatorFactory } from '../Validation/ExecutableValidator';
import { CodeValidator } from './Validation/CodeValidator';
import { NoDuplicatedLines } from './Validation/Rules/NoDuplicatedLines';
import type { CategoryCollectionSpecificUtilities } from '../CategoryCollectionSpecificUtilities';

export interface ScriptParser {
  (
    data: ScriptData,
    collectionUtilities: CategoryCollectionSpecificUtilities,
    scriptUtilities?: ScriptParserUtilities,
  ): Script;
}

export const parseScript: ScriptParser = (
  data,
  collectionUtilities,
  utilities = DefaultScriptParserUtilities,
) => {
  const validator = utilities.createValidator({
    type: ExecutableType.Script,
    self: data,
  });
  validateScript(data, validator);
  try {
    const script = utilities.createScript({
      name: data.name,
      code: parseCode(data, collectionUtilities, utilities.codeValidator, utilities.createCode),
      docs: utilities.parseDocs(data),
      level: parseLevel(data.recommend, utilities.levelParser),
    });
    return script;
  } catch (error) {
    throw utilities.wrapError(
      error,
      validator.createContextualErrorMessage('Failed to parse script.'),
    );
  }
};

function parseLevel(
  level: string | undefined,
  parser: IEnumParser<RecommendationLevel>,
): RecommendationLevel | undefined {
  if (!level) {
    return undefined;
  }
  return parser.parseEnum(level, 'level');
}

function parseCode(
  script: ScriptData,
  collectionUtilities: CategoryCollectionSpecificUtilities,
  codeValidator: ICodeValidator,
  createCode: ScriptCodeFactory,
): ScriptCode {
  if (collectionUtilities.compiler.canCompile(script)) {
    return collectionUtilities.compiler.compile(script);
  }
  const codeScript = script as CodeScriptData; // Must be inline code if it cannot be compiled
  const code = createCode(codeScript.code, codeScript.revertCode);
  validateHardcodedCodeWithoutCalls(code, codeValidator, collectionUtilities.syntax);
  return code;
}

function validateHardcodedCodeWithoutCalls(
  scriptCode: ScriptCode,
  validator: ICodeValidator,
  syntax: ILanguageSyntax,
) {
  [scriptCode.execute, scriptCode.revert]
    .filter((code): code is string => Boolean(code))
    .forEach(
      (code) => validator.throwIfInvalid(
        code,
        [new NoEmptyLines(), new NoDuplicatedLines(syntax)],
      ),
    );
}

function validateScript(
  script: ScriptData,
  validator: ExecutableValidator,
): asserts script is NonNullable<ScriptData> {
  validator.assertDefined(script);
  validator.assertValidName(script.name);
  validator.assert(
    () => Boolean((script as CodeScriptData).code || (script as CallScriptData).call),
    'Neither "call" or "code" is defined.',
  );
  validator.assert(
    () => !((script as CodeScriptData).code && (script as CallScriptData).call),
    'Both "call" and "code" are defined.',
  );
  validator.assert(
    () => !((script as CodeScriptData).revertCode && (script as CallScriptData).call),
    'Both "call" and "revertCode" are defined.',
  );
}

interface ScriptParserUtilities {
  readonly levelParser: IEnumParser<RecommendationLevel>;
  readonly createScript: ScriptFactory;
  readonly codeValidator: ICodeValidator;
  readonly wrapError: ErrorWithContextWrapper;
  readonly createValidator: ExecutableValidatorFactory;
  readonly createCode: ScriptCodeFactory;
  readonly parseDocs: DocsParser;
}

export type ScriptFactory = (
  ...parameters: ConstructorParameters<typeof CollectionScript>
) => Script;

const createScript: ScriptFactory = (...parameters) => {
  return new CollectionScript(...parameters);
};

const DefaultScriptParserUtilities: ScriptParserUtilities = {
  levelParser: createEnumParser(RecommendationLevel),
  createScript,
  codeValidator: CodeValidator.instance,
  wrapError: wrapErrorWithAdditionalContext,
  createValidator: createExecutableDataValidator,
  createCode: createScriptCode,
  parseDocs,
};
