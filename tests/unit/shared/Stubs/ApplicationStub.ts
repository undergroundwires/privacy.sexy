import { IApplication } from '@/domain/IApplication';
import { ICategoryCollection } from '@/domain/ICategoryCollection';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { IProjectInformation } from '@/domain/IProjectInformation';
import { ProjectInformationStub } from './ProjectInformationStub';
import { CategoryCollectionStub } from './CategoryCollectionStub';

export class ApplicationStub implements IApplication {
  public info: IProjectInformation = new ProjectInformationStub();

  public collections: ICategoryCollection[] = [];

  public getCollection(operatingSystem: OperatingSystem): ICategoryCollection {
    const collection = this.collections.find((c) => c.os === operatingSystem);
    return collection ?? new CategoryCollectionStub();
  }

  public getSupportedOsList(): OperatingSystem[] {
    return this.collections.map((collection) => collection.os);
  }

  public withCollection(collection: ICategoryCollection): this {
    this.collections.push(collection);
    return this;
  }

  public withProjectInformation(info: IProjectInformation): this {
    this.info = info;
    return this;
  }

  public withCollections(...collections: readonly ICategoryCollection[]): this {
    this.collections.push(...collections);
    return this;
  }
}
