import type { ScriptData, CodeScriptData, CallScriptData } from '@/application/collections/';
import { NoEmptyLines } from '@/application/Parser/Executable/Script/Validation/Rules/NoEmptyLines';
import type { ILanguageSyntax } from '@/application/Parser/Executable/Script/Validation/Syntax/ILanguageSyntax';
import { CollectionScript } from '@/domain/Executables/Script/CollectionScript';
import { RecommendationLevel } from '@/domain/Executables/Script/RecommendationLevel';
import type { ScriptCode } from '@/domain/Executables/Script/Code/ScriptCode';
import type { ICodeValidator } from '@/application/Parser/Executable/Script/Validation/ICodeValidator';
import { wrapErrorWithAdditionalContext, type ErrorWithContextWrapper } from '@/application/Parser/Common/ContextualError';
import type { ScriptCodeFactory } from '@/domain/Executables/Script/Code/ScriptCodeFactory';
import { createScriptCode } from '@/domain/Executables/Script/Code/ScriptCodeFactory';
import type { Script } from '@/domain/Executables/Script/Script';
import { createEnumParser, type EnumParser } from '@/application/Common/Enum';
import { filterEmptyStrings } from '@/application/Common/Text/FilterEmptyStrings';
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
  scriptUtilities = DefaultUtilities,
) => {
  const validator = scriptUtilities.createValidator({
    type: ExecutableType.Script,
    self: data,
  });
  validateScript(data, validator);
  try {
    const script = scriptUtilities.createScript({
      name: data.name,
      code: parseCode(
        data,
        collectionUtilities,
        scriptUtilities.codeValidator,
        scriptUtilities.createCode,
      ),
      docs: scriptUtilities.parseDocs(data),
      level: parseLevel(data.recommend, scriptUtilities.levelParser),
    });
    return script;
  } catch (error) {
    throw scriptUtilities.wrapError(
      error,
      validator.createContextualErrorMessage('Failed to parse script.'),
    );
  }
};

function parseLevel(
  level: string | undefined,
  parser: EnumParser<RecommendationLevel>,
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
  filterEmptyStrings([scriptCode.execute, scriptCode.revert])
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
  validator.assertType((v) => v.assertObject<CallScriptData & CodeScriptData>({
    value: script,
    valueName: `Script '${script.name}'` ?? 'Script',
    allowedProperties: [
      'name', 'recommend', 'code', 'revertCode', 'call', 'docs',
    ],
  }));
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
  readonly levelParser: EnumParser<RecommendationLevel>;
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

const DefaultUtilities: ScriptParserUtilities = {
  levelParser: createEnumParser(RecommendationLevel),
  createScript,
  codeValidator: CodeValidator.instance,
  wrapError: wrapErrorWithAdditionalContext,
  createValidator: createExecutableDataValidator,
  createCode: createScriptCode,
  parseDocs,
};
