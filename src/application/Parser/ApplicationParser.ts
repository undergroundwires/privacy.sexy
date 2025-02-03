import type { CollectionData } from '@/application/collections/';
import type { Application } from '@/domain/Application/Application';
import WindowsData from '@/application/collections/windows.yaml';
import MacOsData from '@/application/collections/macos.yaml';
import LinuxData from '@/application/collections/linux.yaml';
import { parseProjectDetails, type ProjectDetailsParser } from '@/application/Parser/Project/ProjectDetailsParser';
import { createApplication, type ApplicationFactory } from '@/domain/Application/ApplicationFactory';
import { parseCategoryCollection, type CategoryCollectionParser } from './CategoryCollectionParser';
import { createTypeValidator, type TypeValidator } from './Common/TypeValidator';

export function parseApplication(
  collectionsData: readonly CollectionData[] = PreParsedCollections,
  utilities: ApplicationParserUtilities = DefaultUtilities,
  appFactory: ApplicationFactory = createApplication,
): Application {
  validateCollectionsData(collectionsData, utilities.validator);
  const projectDetails = utilities.parseProjectDetails();
  const collections = collectionsData.map(
    (collection) => utilities.parseCategoryCollection(collection, projectDetails),
  );
  const app = appFactory({
    projectDetails,
    collections,
  });
  return app;
}

const PreParsedCollections: readonly CollectionData[] = [
  WindowsData, MacOsData, LinuxData,
];

function validateCollectionsData(
  collections: readonly CollectionData[],
  validator: TypeValidator,
) {
  validator.assertNonEmptyCollection({
    value: collections,
    valueName: 'Collections',
  });
}

interface ApplicationParserUtilities {
  readonly parseCategoryCollection: CategoryCollectionParser;
  readonly validator: TypeValidator;
  readonly parseProjectDetails: ProjectDetailsParser;
}

const DefaultUtilities: ApplicationParserUtilities = {
  parseCategoryCollection,
  parseProjectDetails,
  validator: createTypeValidator(),
};
