import type { ScriptData, CodeScriptData, CallScriptData } from '@/application/collections/';
import { NoEmptyLines } from '@/application/Parser/Script/Validation/Rules/NoEmptyLines';
import type { ILanguageSyntax } from '@/application/Parser/Script/Validation/Syntax/ILanguageSyntax';
import { Script } from '@/domain/Script';
import { RecommendationLevel } from '@/domain/RecommendationLevel';
import type { IScriptCode } from '@/domain/IScriptCode';
import type { ICodeValidator } from '@/application/Parser/Script/Validation/ICodeValidator';
import { wrapErrorWithAdditionalContext, type ErrorWithContextWrapper } from '@/application/Parser/ContextualError';
import type { ScriptCodeFactory } from '@/domain/ScriptCodeFactory';
import { createScriptCode } from '@/domain/ScriptCodeFactory';
import type { IScript } from '@/domain/IScript';
import { parseDocs, type DocsParser } from '../DocumentationParser';
import { createEnumParser, type IEnumParser } from '../../Common/Enum';
import { NodeDataType } from '../NodeValidation/NodeDataType';
import { createNodeDataValidator, type NodeDataValidator, type NodeDataValidatorFactory } from '../NodeValidation/NodeDataValidator';
import { CodeValidator } from './Validation/CodeValidator';
import { NoDuplicatedLines } from './Validation/Rules/NoDuplicatedLines';
import type { ICategoryCollectionParseContext } from './ICategoryCollectionParseContext';

export interface ScriptParser {
  (
    data: ScriptData,
    context: ICategoryCollectionParseContext,
    utilities?: ScriptParserUtilities,
  ): IScript;
}

export const parseScript: ScriptParser = (
  data,
  context,
  utilities = DefaultScriptParserUtilities,
) => {
  const validator = utilities.createValidator({
    type: NodeDataType.Script,
    selfNode: data,
  });
  validateScript(data, validator);
  try {
    const script = utilities.createScript({
      name: data.name,
      code: parseCode(data, context, utilities.codeValidator, utilities.createCode),
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
  context: ICategoryCollectionParseContext,
  codeValidator: ICodeValidator,
  createCode: ScriptCodeFactory,
): IScriptCode {
  if (context.compiler.canCompile(script)) {
    return context.compiler.compile(script);
  }
  const codeScript = script as CodeScriptData; // Must be inline code if it cannot be compiled
  const code = createCode(codeScript.code, codeScript.revertCode);
  validateHardcodedCodeWithoutCalls(code, codeValidator, context.syntax);
  return code;
}

function validateHardcodedCodeWithoutCalls(
  scriptCode: IScriptCode,
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
  validator: NodeDataValidator,
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
  readonly createValidator: NodeDataValidatorFactory;
  readonly createCode: ScriptCodeFactory;
  readonly parseDocs: DocsParser;
}

export type ScriptFactory = (
  ...parameters: ConstructorParameters<typeof Script>
) => IScript;

const createScript: ScriptFactory = (...parameters) => {
  return new Script(...parameters);
};

const DefaultScriptParserUtilities: ScriptParserUtilities = {
  levelParser: createEnumParser(RecommendationLevel),
  createScript,
  codeValidator: CodeValidator.instance,
  wrapError: wrapErrorWithAdditionalContext,
  createValidator: createNodeDataValidator,
  createCode: createScriptCode,
  parseDocs,
};
