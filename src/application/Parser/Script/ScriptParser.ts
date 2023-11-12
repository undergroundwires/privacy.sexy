import type { ScriptData, CodeScriptData, CallScriptData } from '@/application/collections/';
import { NoEmptyLines } from '@/application/Parser/Script/Validation/Rules/NoEmptyLines';
import { ILanguageSyntax } from '@/application/Parser/Script/Validation/Syntax/ILanguageSyntax';
import { Script } from '@/domain/Script';
import { RecommendationLevel } from '@/domain/RecommendationLevel';
import { IScriptCode } from '@/domain/IScriptCode';
import { ScriptCode } from '@/domain/ScriptCode';
import { ICodeValidator } from '@/application/Parser/Script/Validation/ICodeValidator';
import { parseDocs } from '../DocumentationParser';
import { createEnumParser, IEnumParser } from '../../Common/Enum';
import { NodeType } from '../NodeValidation/NodeType';
import { NodeValidator } from '../NodeValidation/NodeValidator';
import { ICategoryCollectionParseContext } from './ICategoryCollectionParseContext';
import { CodeValidator } from './Validation/CodeValidator';
import { NoDuplicatedLines } from './Validation/Rules/NoDuplicatedLines';

export function parseScript(
  data: ScriptData,
  context: ICategoryCollectionParseContext,
  levelParser = createEnumParser(RecommendationLevel),
  scriptFactory: ScriptFactoryType = ScriptFactory,
  codeValidator: ICodeValidator = CodeValidator.instance,
): Script {
  const validator = new NodeValidator({ type: NodeType.Script, selfNode: data });
  validateScript(data, validator);
  try {
    const script = scriptFactory(
      /* name: */ data.name,
      /* code: */ parseCode(data, context, codeValidator),
      /* docs: */ parseDocs(data),
      /* level: */ parseLevel(data.recommend, levelParser),
    );
    return script;
  } catch (err) {
    return validator.throw(err.message);
  }
}

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
): IScriptCode {
  if (context.compiler.canCompile(script)) {
    return context.compiler.compile(script);
  }
  const codeScript = script as CodeScriptData; // Must be inline code if it cannot be compiled
  const code = new ScriptCode(codeScript.code, codeScript.revertCode);
  validateHardcodedCodeWithoutCalls(code, codeValidator, context.syntax);
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
  validator: NodeValidator,
): asserts script is NonNullable<ScriptData> {
  validator
    .assertDefined(script)
    .assertValidName(script.name)
    .assert(
      () => Boolean((script as CodeScriptData).code || (script as CallScriptData).call),
      'Neither "call" or "code" is defined.',
    )
    .assert(
      () => !((script as CodeScriptData).code && (script as CallScriptData).call),
      'Both "call" and "code" are defined.',
    )
    .assert(
      () => !((script as CodeScriptData).revertCode && (script as CallScriptData).call),
      'Both "call" and "revertCode" are defined.',
    );
}

export type ScriptFactoryType = (...parameters: ConstructorParameters<typeof Script>) => Script;

const ScriptFactory: ScriptFactoryType = (...parameters) => new Script(...parameters);
