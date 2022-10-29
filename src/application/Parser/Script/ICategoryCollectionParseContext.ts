import { IScriptCompiler } from './Compiler/IScriptCompiler';
import { ILanguageSyntax } from './Validation/Syntax/ILanguageSyntax';

export interface ICategoryCollectionParseContext {
  readonly compiler: IScriptCompiler;
  readonly syntax: ILanguageSyntax;
}
