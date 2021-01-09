import { Script } from '@/domain/Script';
import { ScriptData } from 'js-yaml-loader!@/*';
import { parseDocUrls } from './DocumentationParser';
import { RecommendationLevel } from '@/domain/RecommendationLevel';
import { IScriptCompiler } from './Compiler/IScriptCompiler';
import { IScriptCode } from '@/domain/IScriptCode';
import { ScriptCode } from '@/domain/ScriptCode';
import { createEnumParser, IEnumParser } from '../Common/Enum';

export function parseScript(
    data: ScriptData, compiler: IScriptCompiler,
    levelParser = createEnumParser(RecommendationLevel)): Script {
    validateScript(data);
    if (!compiler) {
        throw new Error('undefined compiler');
    }
    const script = new Script(
        /* name */  data.name,
        /* code */  parseCode(data, compiler),
        /* docs */  parseDocUrls(data),
        /* level */ parseLevel(data.recommend, levelParser));
    return script;
}

function parseLevel(level: string, parser: IEnumParser<RecommendationLevel>): RecommendationLevel | undefined {
    if (!level) {
        return undefined;
    }
    return parser.parseEnum(level, 'level');
}

function parseCode(script: ScriptData, compiler: IScriptCompiler): IScriptCode {
    if (compiler.canCompile(script)) {
        return compiler.compile(script);
    }
    return new ScriptCode(script.name, script.code, script.revertCode);
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
        throw new Error('undefined script');
    }
    if (!script.code && !script.call) {
        throw new Error('must define either "call" or "code"');
    }
    ensureNotBothCallAndCode(script);
}
