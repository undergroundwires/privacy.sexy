import type { ScriptData, CodeScriptData, CallScriptData } from '@/application/collections/';
import { NoEmptyLines } from '@/application/Parser/Script/Validation/Rules/NoEmptyLines';
import type { ILanguageSyntax } from '@/application/Parser/Script/Validation/Syntax/ILanguageSyntax';
import { CollectionScript } from '@/domain/Executables/Script/CollectionScript';
import { RecommendationLevel } from '@/domain/Executables/Script/RecommendationLevel';
import type { ScriptCode } from '@/domain/Executables/Script/Code/ScriptCode';
import type { ICodeValidator } from '@/application/Parser/Script/Validation/ICodeValidator';
import { DistinctReversibleScriptCode } from '@/domain/Executables/Script/Code/DistinctReversibleScriptCode';
import { parseDocs } from '../DocumentationParser';
import { createEnumParser, type IEnumParser } from '../../Common/Enum';
import { NodeType } from '../NodeValidation/NodeType';
import { NodeValidator } from '../NodeValidation/NodeValidator';
import { CodeValidator } from './Validation/CodeValidator';
import { NoDuplicatedLines } from './Validation/Rules/NoDuplicatedLines';
import type { CategoryCollectionParseContext } from './CategoryCollectionParseContext';

export function parseScript(
  data: ScriptData,
  context: CategoryCollectionParseContext,
  levelParser = createEnumParser(RecommendationLevel),
  scriptFactory: ScriptFactoryType = ScriptFactory,
  codeValidator: ICodeValidator = CodeValidator.instance,
): CollectionScript {
  const validator = new NodeValidator({ type: NodeType.Script, selfNode: data });
  validateScript(data, validator);
  try {
    const script = scriptFactory(
      /* id: */ context.keyFactory.createExecutableKey(data.id),
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
  context: CategoryCollectionParseContext,
  codeValidator: ICodeValidator,
): ScriptCode {
  if (context.compiler.canCompile(script)) {
    return context.compiler.compile(script);
  }
  const codeScript = script as CodeScriptData; // Must be inline code if it cannot be compiled
  const code = new DistinctReversibleScriptCode(codeScript.code, codeScript.revertCode);
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
    .assertExecutableId(script.id) // TODO: Unit test this
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

export type ScriptFactoryType = (
  ...parameters: ConstructorParameters<typeof CollectionScript>
) => CollectionScript;

const ScriptFactory: ScriptFactoryType = (...parameters) => new CollectionScript(...parameters);
