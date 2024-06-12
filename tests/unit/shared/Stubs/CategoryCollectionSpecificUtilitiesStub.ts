import type { IScriptCompiler } from '@/application/Parser/Executable/Script/Compiler/IScriptCompiler';
import type { ILanguageSyntax } from '@/application/Parser/Executable/Script/Validation/Syntax/ILanguageSyntax';
import type { CategoryCollectionSpecificUtilities } from '@/application/Parser/Executable/CategoryCollectionSpecificUtilities';
import { ScriptCompilerStub } from './ScriptCompilerStub';
import { LanguageSyntaxStub } from './LanguageSyntaxStub';

export class CategoryCollectionSpecificUtilitiesStub
implements CategoryCollectionSpecificUtilities {
  public compiler: IScriptCompiler = new ScriptCompilerStub();

  public syntax: ILanguageSyntax = new LanguageSyntaxStub();

  public withCompiler(compiler: IScriptCompiler) {
    this.compiler = compiler;
    return this;
  }

  public withSyntax(syntax: ILanguageSyntax) {
    this.syntax = syntax;
    return this;
  }
}
