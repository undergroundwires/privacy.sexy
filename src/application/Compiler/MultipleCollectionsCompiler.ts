import type { CollectionData } from '@/application/collections/';
import type { ProjectDetails } from '@/domain/Project/ProjectDetails';
import { createTypeValidator, type TypeValidator } from './Common/TypeValidator';
import { compileCollection, type SingleCollectionCompiler } from './Collection/SingleCollectionCompiler';
import type { CompiledCollectionDto } from './CompiledCollectionDto';

/**
 * This utility is responsible for compiling collection data into an application object.
 * It serves as part of the application layer, parsing and compiling the application data
 * defined in collection YAML files.
 *
 * The compiler creates basic, decoupled abstractions without external references,
 * acting as an anti-corruption layer. This design allows for independent changes
 * to the compiler and its models.
 */
export interface MultipleCollectionsCompiler {
  (
    collectionsData: readonly CollectionData[],
    projectDetails: ProjectDetails,
    utilities?: CollectionCompilerUtilities,
  ): CompiledCollectionDto[];
}

export const compileCollections: MultipleCollectionsCompiler = (
  collectionsData,
  projectDetails,
  utilities = DefaultUtilities,
) => {
  validateCollectionsData(collectionsData, utilities.validator);
  const collections = collectionsData.map(
    (collection) => utilities.compileCollection(collection, projectDetails),
  );
  return collections;
};

interface CollectionCompilerUtilities {
  readonly validator: TypeValidator;
  readonly compileCollection: SingleCollectionCompiler;
}

const DefaultUtilities: CollectionCompilerUtilities = {
  validator: createTypeValidator(),
  compileCollection,
};

function validateCollectionsData(
  collections: readonly CollectionData[],
  validator: TypeValidator,
) {
  validator.assertNonEmptyCollection({
    value: collections,
    valueName: 'Collections',
  });
}
