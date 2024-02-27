import type { IApplication } from '@/domain/IApplication';
import type { ICategoryCollection } from '@/domain/ICategoryCollection';
import { OperatingSystem } from '@/domain/OperatingSystem';
import type { ProjectDetails } from '@/domain/Project/ProjectDetails';
import { ProjectDetailsStub } from './ProjectDetailsStub';
import { CategoryCollectionStub } from './CategoryCollectionStub';

export class ApplicationStub implements IApplication {
  public projectDetails: ProjectDetails = new ProjectDetailsStub();

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

  public withProjectDetails(info: ProjectDetails): this {
    this.projectDetails = info;
    return this;
  }

  public withCollections(...collections: readonly ICategoryCollection[]): this {
    this.collections.push(...collections);
    return this;
  }
}
