import type { ScriptData } from '@/application/collections/';
import type { IScriptCompiler } from '@/application/Parser/Executable/Script/Compiler/IScriptCompiler';
import type { ScriptCode } from '@/domain/Executables/Script/Code/ScriptCode';
import { ScriptCodeStub } from './ScriptCodeStub';

export class ScriptCompilerStub implements IScriptCompiler {
  public compilableScripts = new Map<ScriptData, ScriptCode>();

  public canCompile(script: ScriptData): boolean {
    return this.compilableScripts.has(script);
  }

  public compile(script: ScriptData): ScriptCode {
    const foundCode = this.compilableScripts.get(script);
    if (foundCode) {
      return foundCode;
    }
    return new ScriptCodeStub();
  }

  public withCompileAbility(script: ScriptData, result?: ScriptCode): this {
    this.compilableScripts.set(
      script,
      result ?? { execute: `compiled code of ${script.name}`, revert: `compiled revert code of ${script.name}` },
    );
    return this;
  }
}
