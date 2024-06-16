import type { IScriptingDefinition } from '@/domain/IScriptingDefinition';
import type { FunctionData } from '@/application/collections/';
import type { CategoryCollectionKey } from '@/domain/Collection/Key/CategoryCollectionKey';
import { ScriptCompiler } from './Script/Compiler/ScriptCompiler';
import { SyntaxFactory } from './Script/Validation/Syntax/SyntaxFactory';
import { PartialGuidExecutableKeyFactory } from './KeyFactory/PartialGuidExecutableKeyFactory';
import type { IScriptCompiler } from './Script/Compiler/IScriptCompiler';
import type { ILanguageSyntax } from './Script/Validation/Syntax/ILanguageSyntax';
import type { ISyntaxFactory } from './Script/Validation/Syntax/ISyntaxFactory';
import type { CollectionExecutableKeyFactory } from './KeyFactory/CollectionExecutableKeyFactory';

export interface CategoryCollectionSpecificUtilities {
  readonly compiler: IScriptCompiler;
  readonly syntax: ILanguageSyntax;
  readonly keyFactory: CollectionExecutableKeyFactory;
}

export const createCollectionUtilities: CategoryCollectionSpecificUtilitiesFactory = (
  collectionKey: CategoryCollectionKey,
  functionsData: ReadonlyArray<FunctionData> | undefined,
  scripting: IScriptingDefinition,
  syntaxFactory: ISyntaxFactory = new SyntaxFactory(),
) => {
  const syntax = syntaxFactory.create(scripting.language);
  return {
    compiler: new ScriptCompiler({
      functions: functionsData ?? [],
      syntax,
    }),
    syntax,
    keyFactory: new PartialGuidExecutableKeyFactory(collectionKey),
  };
};

export interface CategoryCollectionSpecificUtilitiesFactory {
  (
    collectionKey: CategoryCollectionKey,
    functionsData: ReadonlyArray<FunctionData> | undefined,
    scripting: IScriptingDefinition,
    syntaxFactory?: ISyntaxFactory,
  ): CategoryCollectionSpecificUtilities;
}
