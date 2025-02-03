import type { Application } from '@/domain/Application/Application';
import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import { OperatingSystem } from '@/domain/OperatingSystem';
import type { ProjectDetails } from '@/domain/Project/ProjectDetails';
import { ProjectDetailsStub } from './ProjectDetailsStub';
import { CategoryCollectionStub } from './CategoryCollectionStub';

export class ApplicationStub implements Application {
  public projectDetails: ProjectDetails = new ProjectDetailsStub();

  public collections: CategoryCollection[] = [];

  public getCollection(operatingSystem: OperatingSystem): CategoryCollection {
    const collection = this.collections.find((c) => c.os === operatingSystem);
    return collection ?? new CategoryCollectionStub();
  }

  public getSupportedOsList(): OperatingSystem[] {
    return this.collections.map((collection) => collection.os);
  }

  public withCollection(collection: CategoryCollection): this {
    this.collections.push(collection);
    return this;
  }

  public withProjectDetails(info: ProjectDetails): this {
    this.projectDetails = info;
    return this;
  }

  public withCollections(...collections: readonly CategoryCollection[]): this {
    this.collections.push(...collections);
    return this;
  }
}
