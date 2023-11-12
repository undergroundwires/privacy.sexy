import type { ScriptData } from '@/application/collections/';
import { IScriptCompiler } from '@/application/Parser/Script/Compiler/IScriptCompiler';
import { IScriptCode } from '@/domain/IScriptCode';
import { ScriptCodeStub } from './ScriptCodeStub';

export class ScriptCompilerStub implements IScriptCompiler {
  public compilableScripts = new Map<ScriptData, IScriptCode>();

  public canCompile(script: ScriptData): boolean {
    return this.compilableScripts.has(script);
  }

  public compile(script: ScriptData): IScriptCode {
    const foundCode = this.compilableScripts.get(script);
    if (foundCode) {
      return foundCode;
    }
    return new ScriptCodeStub();
  }

  public withCompileAbility(script: ScriptData, result?: IScriptCode): this {
    this.compilableScripts.set(
      script,
      result ?? { execute: `compiled code of ${script.name}`, revert: `compiled revert code of ${script.name}` },
    );
    return this;
  }
}
