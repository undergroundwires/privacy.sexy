import { ICategoryCollectionParseContext } from '@/application/Parser/Script/ICategoryCollectionParseContext';
import { ScriptCompilerStub } from './ScriptCompilerStub';
import { LanguageSyntaxStub } from './LanguageSyntaxStub';
import { IScriptCompiler } from '@/application/Parser/Script/Compiler/IScriptCompiler';
import { ILanguageSyntax } from '@/domain/ScriptCode';

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
