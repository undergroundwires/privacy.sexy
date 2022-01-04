import type { FunctionData } from '@/application/collections/';
import type { IScriptingDefinition } from '@/domain/IScriptingDefinition';
import type { CategoryCollectionKey } from '@/domain/Collection/Key/CategoryCollectionKey';
import { ScriptCompiler } from './Compiler/ScriptCompiler';
import { SyntaxFactory } from './Validation/Syntax/SyntaxFactory';
import { PartialGuidExecutableKeyFactory } from './KeyFactory/PartialGuidExecutableKeyFactory';
import type { IScriptCompiler } from './Compiler/IScriptCompiler';
import type { CategoryCollectionParseContext } from './CategoryCollectionParseContext';
import type { ISyntaxFactory } from './Validation/Syntax/ISyntaxFactory';
import type { ILanguageSyntax } from './Validation/Syntax/ILanguageSyntax';
import type { CollectionExecutableKeyFactory } from './KeyFactory/CollectionExecutableKeyFactory';

// TODO: Unit tests for createExecutableKey

export class CategoryCollectionParseContextFacade implements CategoryCollectionParseContext { // TODO: Is this best name possible?
  public readonly compiler: IScriptCompiler;

  public readonly syntax: ILanguageSyntax;

  public readonly keyFactory: CollectionExecutableKeyFactory;

  constructor(
    collectionKey: CategoryCollectionKey,
    functionsData: ReadonlyArray<FunctionData> | undefined,
    scripting: IScriptingDefinition,
    syntaxFactory: ISyntaxFactory = new SyntaxFactory(),
  ) {
    this.syntax = syntaxFactory.create(scripting.language);
    this.compiler = new ScriptCompiler(functionsData ?? [], this.syntax);
    this.keyFactory = new PartialGuidExecutableKeyFactory(collectionKey);
  }
}
