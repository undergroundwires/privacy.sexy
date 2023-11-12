import type { CollectionData } from '@/application/collections/';
import { IApplication } from '@/domain/IApplication';
import { IProjectInformation } from '@/domain/IProjectInformation';
import { ICategoryCollection } from '@/domain/ICategoryCollection';
import WindowsData from '@/application/collections/windows.yaml';
import MacOsData from '@/application/collections/macos.yaml';
import LinuxData from '@/application/collections/linux.yaml';
import { parseProjectInformation } from '@/application/Parser/ProjectInformationParser';
import { Application } from '@/domain/Application';
import { IAppMetadata } from '@/infrastructure/EnvironmentVariables/IAppMetadata';
import { EnvironmentVariablesFactory } from '@/infrastructure/EnvironmentVariables/EnvironmentVariablesFactory';
import { parseCategoryCollection } from './CategoryCollectionParser';

export function parseApplication(
  categoryParser = parseCategoryCollection,
  informationParser = parseProjectInformation,
  metadata: IAppMetadata = EnvironmentVariablesFactory.Current.instance,
  collectionsData = PreParsedCollections,
): IApplication {
  validateCollectionsData(collectionsData);
  const information = informationParser(metadata);
  const collections = collectionsData.map((collection) => categoryParser(collection, information));
  const app = new Application(information, collections);
  return app;
}

export type CategoryCollectionParserType
    = (file: CollectionData, info: IProjectInformation) => ICategoryCollection;

const PreParsedCollections: readonly CollectionData [] = [
  WindowsData, MacOsData, LinuxData,
];

function validateCollectionsData(collections: readonly CollectionData[]) {
  if (!collections.length) {
    throw new Error('missing collections');
  }
}
