import type { IScriptCompiler } from './Compiler/IScriptCompiler';
import type { ILanguageSyntax } from './Validation/Syntax/ILanguageSyntax';

export interface ICategoryCollectionParseContext {
  readonly compiler: IScriptCompiler;
  readonly syntax: ILanguageSyntax;
}
