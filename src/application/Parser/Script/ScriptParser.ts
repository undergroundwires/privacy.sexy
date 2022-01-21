import { ScriptData } from 'js-yaml-loader!@/*';
import { Script } from '@/domain/Script';
import { RecommendationLevel } from '@/domain/RecommendationLevel';
import { IScriptCode } from '@/domain/IScriptCode';
import { ScriptCode } from '@/domain/ScriptCode';
import { parseDocUrls } from '../DocumentationParser';
import { createEnumParser, IEnumParser } from '../../Common/Enum';
import { ICategoryCollectionParseContext } from './ICategoryCollectionParseContext';

export function parseScript(
  data: ScriptData,
  context: ICategoryCollectionParseContext,
  levelParser = createEnumParser(RecommendationLevel),
): Script {
  validateScript(data);
  if (!context) { throw new Error('missing context'); }
  const script = new Script(
    /* name: */ data.name,
    /* code: */ parseCode(data, context),
    /* docs: */ parseDocUrls(data),
    /* level: */ parseLevel(data.recommend, levelParser),
  );
  return script;
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

function ensureNotBothCallAndCode(script: ScriptData) {
  if (script.code && script.call) {
    throw new Error('cannot define both "call" and "code"');
  }
  if (script.revertCode && script.call) {
    throw new Error('cannot define "revertCode" if "call" is defined');
  }
}

function validateScript(script: ScriptData) {
  if (!script) {
    throw new Error('missing script');
  }
  if (!script.code && !script.call) {
    throw new Error('must define either "call" or "code"');
  }
  ensureNotBothCallAndCode(script);
}
