import type { CollectionData } from '@/application/collections/';
import { IApplication } from '@/domain/IApplication';
import { IProjectInformation } from '@/domain/IProjectInformation';
import { ICategoryCollection } from '@/domain/ICategoryCollection';
import WindowsData from '@/application/collections/windows.yaml';
import MacOsData from '@/application/collections/macos.yaml';
import LinuxData from '@/application/collections/linux.yaml';
import { parseProjectInformation } from '@/application/Parser/ProjectInformationParser';
import { Application } from '@/domain/Application';
import { parseCategoryCollection } from './CategoryCollectionParser';

export function parseApplication(
  parser = CategoryCollectionParser,
  processEnv: NodeJS.ProcessEnv = process.env,
  collectionsData = PreParsedCollections,
): IApplication {
  validateCollectionsData(collectionsData);
  const information = parseProjectInformation(processEnv);
  const collections = collectionsData.map((collection) => parser(collection, information));
  const app = new Application(information, collections);
  return app;
}

export type CategoryCollectionParserType
    = (file: CollectionData, info: IProjectInformation) => ICategoryCollection;

const CategoryCollectionParser: CategoryCollectionParserType = (file, info) => {
  return parseCategoryCollection(file, info);
};

const PreParsedCollections: readonly CollectionData [] = [
  WindowsData, MacOsData, LinuxData,
];

function validateCollectionsData(collections: readonly CollectionData[]) {
  if (!collections || !collections.length) {
    throw new Error('missing collections');
  }
  if (collections.some((collection) => !collection)) {
    throw new Error('missing collection provided');
  }
}
