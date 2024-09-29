import { compileCollections, type CollectionsCompiler } from '@/application/Compiler/CollectionCompiler';
import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import type { ProjectDetails } from '@/domain/Project/ProjectDetails';
import { convertToCategoryCollections, type CompilerAdapter } from './CompilerAdapter';
import { loadPreloadedCollection } from './DataProvider/PreloadedCollectionDataProvider';
import type { CollectionDataProvider } from './DataProvider/CollectionDataProvider';

export interface CollectionsLoader {
  (
    projectDetails: ProjectDetails,
    utilities?: CollectionsLoaderUtilities,
  ): CategoryCollection[];
}

interface CollectionsLoaderUtilities {
  readonly compileCollections: CollectionsCompiler;
  readonly convertCollection: CompilerAdapter;
  readonly loadCollectionFile: CollectionDataProvider;
}

const DefaultUtilities: CollectionsLoaderUtilities = {
  compileCollections,
  convertCollection: convertToCategoryCollections,
  loadCollectionFile: loadPreloadedCollection,
};

export const loadCollections: CollectionsLoader = (
  projectDetails: ProjectDetails,
  utilities: CollectionsLoaderUtilities = DefaultUtilities,
) => {
  const collectionNames: readonly string[] = ['macos', 'windows', 'linux'];
  const collectionsData = collectionNames.map((name) => utilities.loadCollectionFile(name));
  const compiledCollections = utilities.compileCollections(
    collectionsData,
    projectDetails,
  );
  const collections = utilities.convertCollection(compiledCollections);
  return collections;
};
