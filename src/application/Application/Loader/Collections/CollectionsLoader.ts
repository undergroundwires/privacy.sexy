import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import type { ProjectDetails } from '@/domain/Project/ProjectDetails';
import { compileCollection, type CollectionCompiler } from '@/application/Application/Loader/Collections/Compiler/CollectionCompiler';
import { loadPreloadedCollection } from '@/application/Application/Loader/Collections/DataProvider/PreloadedCollectionDataProvider';
import type { CollectionDataProvider } from './DataProvider/CollectionDataProvider';

export interface CollectionsLoader {
  (
    projectDetails: ProjectDetails,
    utilities?: CollectionsLoaderUtilities,
  ): CategoryCollection[];
}

export const loadCollections: CollectionsLoader = (
  projectDetails,
  utilities = DefaultUtilities,
) => {
  const collectionNames: readonly string[] = ['macos', 'windows', 'linux'];
  const collectionsData = collectionNames.map((name) => utilities.loadCollectionFile(name));
  const collections = collectionsData.map(
    (collection) => utilities.parseCategoryCollection(collection, projectDetails),
  );
  return collections;
};

interface CollectionsLoaderUtilities {
  readonly loadCollectionFile: CollectionDataProvider;
  readonly parseCategoryCollection: CollectionCompiler;
}

const DefaultUtilities: CollectionsLoaderUtilities = {
  loadCollectionFile: loadPreloadedCollection,
  parseCategoryCollection: compileCollection,
};
