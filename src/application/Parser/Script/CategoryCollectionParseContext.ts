import type { ILanguageSyntax } from './Validation/Syntax/ILanguageSyntax';
import type { IScriptCompiler } from './Compiler/IScriptCompiler';
import type { CollectionExecutableKeyFactory } from './KeyFactory/CollectionExecutableKeyFactory';

export interface CategoryCollectionParseContext {
  readonly compiler: IScriptCompiler;
  readonly syntax: ILanguageSyntax;
  readonly keyFactory: CollectionExecutableKeyFactory;
}
