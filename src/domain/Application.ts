import { IApplication } from './IApplication';
import { ICategoryCollection } from './ICategoryCollection';
import { IProjectInformation } from './IProjectInformation';
import { OperatingSystem } from './OperatingSystem';

export class Application implements IApplication {
  constructor(
    public info: IProjectInformation,
    public collections: readonly ICategoryCollection[],
  ) {
    validateInformation(info);
    validateCollections(collections);
  }

  public getSupportedOsList(): OperatingSystem[] {
    return this.collections.map((collection) => collection.os);
  }

  public getCollection(operatingSystem: OperatingSystem): ICategoryCollection | undefined {
    return this.collections.find((collection) => collection.os === operatingSystem);
  }
}

function validateInformation(info: IProjectInformation) {
  if (!info) {
    throw new Error('missing project information');
  }
}

function validateCollections(collections: readonly ICategoryCollection[]) {
  if (!collections || !collections.length) {
    throw new Error('missing collections');
  }
  if (collections.filter((c) => !c).length > 0) {
    throw new Error('undefined collection in the list');
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
