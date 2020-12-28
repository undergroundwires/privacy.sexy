import { Script } from '@/domain/Script';
import { YamlScript } from 'js-yaml-loader!@/application.yaml';
import { parseDocUrls } from './DocumentationParser';
import { RecommendationLevel } from '@/domain/RecommendationLevel';
import { IScriptCompiler } from './Compiler/IScriptCompiler';
import { IScriptCode } from '@/domain/IScriptCode';
import { ScriptCode } from '@/domain/ScriptCode';
import { createEnumParser, IEnumParser } from '../Common/Enum';

export function parseScript(
    yamlScript: YamlScript, compiler: IScriptCompiler,
    levelParser = createEnumParser(RecommendationLevel)): Script {
    validateScript(yamlScript);
    if (!compiler) {
        throw new Error('undefined compiler');
    }
    const script = new Script(
        /* name */  yamlScript.name,
        /* code */  parseCode(yamlScript, compiler),
        /* docs */  parseDocUrls(yamlScript),
        /* level */ parseLevel(yamlScript.recommend, levelParser));
    return script;
}

function parseLevel(level: string, parser: IEnumParser<RecommendationLevel>): RecommendationLevel | undefined {
    if (!level) {
        return undefined;
    }
    return parser.parseEnum(level, 'level');
}

function parseCode(yamlScript: YamlScript, compiler: IScriptCompiler): IScriptCode {
    if (compiler.canCompile(yamlScript)) {
        return compiler.compile(yamlScript);
    }
    return new ScriptCode(yamlScript.name, yamlScript.code, yamlScript.revertCode);
}

function ensureNotBothCallAndCode(yamlScript: YamlScript) {
    if (yamlScript.code && yamlScript.call) {
        throw new Error('cannot define both "call" and "code"');
    }
    if (yamlScript.revertCode && yamlScript.call) {
        throw new Error('cannot define "revertCode" if "call" is defined');
    }
}

function validateScript(yamlScript: YamlScript) {
    if (!yamlScript) {
        throw new Error('undefined script');
    }
    if (!yamlScript.code && !yamlScript.call) {
        throw new Error('must define either "call" or "code"');
    }
    ensureNotBothCallAndCode(yamlScript);
}
