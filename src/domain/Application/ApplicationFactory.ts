import { OperatingSystem } from '../OperatingSystem';
import type { CategoryCollection } from '../Collection/CategoryCollection';
import type { ProjectDetails } from '../Project/ProjectDetails';
import type { Application } from './Application';

export interface ApplicationInitParameters {
  readonly projectDetails: ProjectDetails;
  readonly collections: readonly CategoryCollection[];
}

export type ApplicationFactory = (
  parameters: ApplicationInitParameters,
) => Application;

export const createApplication: ApplicationFactory = (parameters) => {
  validateCollections(parameters.collections);
  return {
    projectDetails: parameters.projectDetails,
    collections: parameters.collections,
    getSupportedOsList: () => getSupportedOperatingSystems(parameters.collections),
    getCollection: (os) => findCollectionByOperatingSystem(os, parameters.collections),
  };
};

function findCollectionByOperatingSystem(
  os: OperatingSystem,
  collections: readonly CategoryCollection[],
) {
  const collection = collections.find((c) => c.os === os);
  if (!collection) {
    throw new Error(`Operating system "${OperatingSystem[os]}" is not defined in application`);
  }
  return collection;
}

function getSupportedOperatingSystems(
  collections: readonly CategoryCollection[],
): OperatingSystem[] {
  return collections.map((collection) => collection.os);
}

function validateCollections(collections: readonly CategoryCollection[]) {
  if (!collections.length) {
    throw new Error('missing collections');
  }
  if (collections.filter((c) => !c).length > 0) {
    throw new Error('missing collection in the list');
  }
  const osList = collections.map((c) => c.os);
  const duplicates = getDuplicates(osList);
  if (duplicates.length > 0) {
    throw new Error(`multiple collections with same os: ${
      duplicates.map((os) => OperatingSystem[os].toLowerCase()).join('", "')}`);
  }
}

function getDuplicates(list: readonly OperatingSystem[]): OperatingSystem[] {
  return list.filter((os, index) => list.indexOf(os) !== index);
}
