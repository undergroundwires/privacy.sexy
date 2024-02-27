import type { CollectionData } from '@/application/collections/';
import type { IApplication } from '@/domain/IApplication';
import type { ProjectDetails } from '@/domain/Project/ProjectDetails';
import type { ICategoryCollection } from '@/domain/ICategoryCollection';
import WindowsData from '@/application/collections/windows.yaml';
import MacOsData from '@/application/collections/macos.yaml';
import LinuxData from '@/application/collections/linux.yaml';
import { parseProjectDetails } from '@/application/Parser/ProjectDetailsParser';
import { Application } from '@/domain/Application';
import type { IAppMetadata } from '@/infrastructure/EnvironmentVariables/IAppMetadata';
import { EnvironmentVariablesFactory } from '@/infrastructure/EnvironmentVariables/EnvironmentVariablesFactory';
import { parseCategoryCollection } from './CategoryCollectionParser';

export function parseApplication(
  categoryParser = parseCategoryCollection,
  projectDetailsParser = parseProjectDetails,
  metadata: IAppMetadata = EnvironmentVariablesFactory.Current.instance,
  collectionsData = PreParsedCollections,
): IApplication {
  validateCollectionsData(collectionsData);
  const projectDetails = projectDetailsParser(metadata);
  const collections = collectionsData.map(
    (collection) => categoryParser(collection, projectDetails),
  );
  const app = new Application(projectDetails, collections);
  return app;
}

export type CategoryCollectionParserType
    = (file: CollectionData, projectDetails: ProjectDetails) => ICategoryCollection;

const PreParsedCollections: readonly CollectionData [] = [
  WindowsData, MacOsData, LinuxData,
];

function validateCollectionsData(collections: readonly CollectionData[]) {
  if (!collections.length) {
    throw new Error('missing collections');
  }
}
