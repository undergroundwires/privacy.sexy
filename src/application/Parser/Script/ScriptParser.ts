import type { ScriptData } from '@/application/collections/';
import { Script } from '@/domain/Script';
import { RecommendationLevel } from '@/domain/RecommendationLevel';
import { IScriptCode } from '@/domain/IScriptCode';
import { ScriptCode } from '@/domain/ScriptCode';
import { parseDocUrls } from '../DocumentationParser';
import { createEnumParser, IEnumParser } from '../../Common/Enum';
import { NodeType } from '../NodeValidation/NodeType';
import { NodeValidator } from '../NodeValidation/NodeValidator';
import { ICategoryCollectionParseContext } from './ICategoryCollectionParseContext';

// eslint-disable-next-line consistent-return
export function parseScript(
  data: ScriptData,
  context: ICategoryCollectionParseContext,
  levelParser = createEnumParser(RecommendationLevel),
  scriptFactory: ScriptFactoryType = ScriptFactory,
): Script {
  const validator = new NodeValidator({ type: NodeType.Script, selfNode: data });
  validateScript(data, validator);
  if (!context) { throw new Error('missing context'); }
  try {
    const script = scriptFactory(
      /* name: */ data.name,
      /* code: */ parseCode(data, context),
      /* docs: */ parseDocUrls(data),
      /* level: */ parseLevel(data.recommend, levelParser),
    );
    return script;
  } catch (err) {
    validator.throw(err.message);
  }
}

function parseLevel(
  level: string,
  parser: IEnumParser<RecommendationLevel>,
): RecommendationLevel | undefined {
  if (!level) {
    return undefined;
  }
  return parser.parseEnum(level, 'level');
}

function parseCode(script: ScriptData, context: ICategoryCollectionParseContext): IScriptCode {
  if (context.compiler.canCompile(script)) {
    return context.compiler.compile(script);
  }
  return new ScriptCode(script.code, script.revertCode, context.syntax);
}

function validateScript(script: ScriptData, validator: NodeValidator) {
  validator
    .assertDefined(script)
    .assertValidName(script.name)
    .assert(
      () => Boolean(script.code || script.call),
      'Must define either "call" or "code".',
    )
    .assert(
      () => !(script.code && script.call),
      'Cannot define both "call" and "code".',
    )
    .assert(
      () => !(script.revertCode && script.call),
      'Cannot define "revertCode" if "call" is defined.',
    );
}

export type ScriptFactoryType = (...parameters: ConstructorParameters<typeof Script>) => Script;

const ScriptFactory: ScriptFactoryType = (...parameters) => new Script(...parameters);
