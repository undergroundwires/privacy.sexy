import { IApplication } from './IApplication';
import { ICategoryCollection } from './ICategoryCollection';
import { IProjectInformation } from './IProjectInformation';
import { OperatingSystem } from './OperatingSystem';

export class Application implements IApplication {
  constructor(
    public info: IProjectInformation,
    public collections: readonly ICategoryCollection[],
  ) {
    validateCollections(collections);
  }

  public getSupportedOsList(): OperatingSystem[] {
    return this.collections.map((collection) => collection.os);
  }

  public getCollection(operatingSystem: OperatingSystem): ICategoryCollection {
    const collection = this.collections.find((c) => c.os === operatingSystem);
    if (!collection) {
      throw new Error(`Operating system "${OperatingSystem[operatingSystem]}" is not defined in application`);
    }
    return collection;
  }
}

function validateCollections(collections: readonly ICategoryCollection[]) {
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
