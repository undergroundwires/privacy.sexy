import { IScriptCompiler } from '@/application/Parser/Compiler/IScriptCompiler';
import { IScriptCode } from '@/domain/IScriptCode';
import { YamlScript } from 'js-yaml-loader!./application.yaml';

export class ScriptCompilerStub implements IScriptCompiler {
    public compilables = new Map<YamlScript, IScriptCode>();
    public canCompile(script: YamlScript): boolean {
        return this.compilables.has(script);
    }
    public compile(script: YamlScript): IScriptCode {
        return this.compilables.get(script);
    }
    public withCompileAbility(script: YamlScript, result?: IScriptCode): ScriptCompilerStub {
        this.compilables.set(script, result ||
            { execute: `compiled code of ${script.name}`, revert: `compiled revert code of ${script.name}` });
        return this;
    }
}
