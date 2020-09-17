import { Script } from '@/domain/Script';
import { YamlScript } from 'js-yaml-loader!./application.yaml';
import { parseDocUrls } from './DocumentationParser';
import { RecommendationLevelNames, RecommendationLevel } from '@/domain/RecommendationLevel';
import { IScriptCompiler } from './Compiler/IScriptCompiler';
import { IScriptCode } from '@/domain/IScriptCode';
import { ScriptCode } from '@/domain/ScriptCode';

export function parseScript(yamlScript: YamlScript, compiler: IScriptCompiler): Script {
    validateScript(yamlScript);
    if (!compiler) {
        throw new Error('undefined compiler');
    }
    const script = new Script(
        /* name */              yamlScript.name,
        /* code */              parseCode(yamlScript, compiler),
        /* docs */              parseDocUrls(yamlScript),
        /* level */             getLevel(yamlScript.recommend));
    return script;
}

function getLevel(level: string): RecommendationLevel | undefined {
    if (!level) {
        return undefined;
    }
    if (typeof level !== 'string') {
        throw new Error(`level must be a string but it was ${typeof level}`);
    }
    const typedLevel = RecommendationLevelNames
        .find((l) => l.toLowerCase() === level.toLowerCase());
    if (!typedLevel) {
        throw new Error(`unknown level: \"${level}\"`);
    }
    return RecommendationLevel[typedLevel as keyof typeof RecommendationLevel];
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
