import type { CategoryCollectionContext } from '@/application/Parser/Executable/CategoryCollectionContext';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import type { ScriptCompiler } from '@/application/Parser/Executable/Script/Compiler/ScriptCompiler';
import { ScriptCompilerStub } from './ScriptCompilerStub';

export class CategoryCollectionContextStub
implements CategoryCollectionContext {
  public compiler: ScriptCompiler = new ScriptCompilerStub();

  public language: ScriptingLanguage = ScriptingLanguage.shellscript;

  public withCompiler(compiler: ScriptCompiler) {
    this.compiler = compiler;
    return this;
  }

  public withLanguage(language: ScriptingLanguage) {
    this.language = language;
    return this;
  }
}
