import { ICategoryCollectionParseContext } from '@/application/Parser/Script/ICategoryCollectionParseContext';
import { IScriptCompiler } from '@/application/Parser/Script/Compiler/IScriptCompiler';
import { ILanguageSyntax } from '@/application/Parser/Script/Validation/Syntax/ILanguageSyntax';
import { ScriptCompilerStub } from './ScriptCompilerStub';
import { LanguageSyntaxStub } from './LanguageSyntaxStub';

export class CategoryCollectionParseContextStub implements ICategoryCollectionParseContext {
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
