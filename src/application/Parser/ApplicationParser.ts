import type { CollectionData } from '@/application/collections/';
import type { IApplication } from '@/domain/IApplication';
import WindowsData from '@/application/collections/windows.yaml';
import MacOsData from '@/application/collections/macos.yaml';
import LinuxData from '@/application/collections/linux.yaml';
import { parseProjectDetails, type ProjectDetailsParser } from '@/application/Parser/ProjectDetailsParser';
import { Application } from '@/domain/Application';
import { parseCategoryCollection, type CategoryCollectionParser } from './CategoryCollectionParser';
import { createTypeValidator, type TypeValidator } from './Common/TypeValidator';

export function parseApplication(
  collectionsData: readonly CollectionData[] = PreParsedCollections,
  utilities: ApplicationParserUtilities = DefaultUtilities,
): IApplication {
  validateCollectionsData(collectionsData, utilities.validator);
  const projectDetails = utilities.parseProjectDetails();
  const collections = collectionsData.map(
    (collection) => utilities.parseCategoryCollection(collection, projectDetails),
  );
  const app = new Application(projectDetails, collections);
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
    valueName: 'collections',
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
