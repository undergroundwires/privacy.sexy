import type { ProjectDetails } from '@/domain/Project/ProjectDetails';
import type { ICategoryCollection } from '@/domain/Collection/ICategoryCollection';
import { getEnumValues } from '@/application/Common/Enum';
import type { CollectionData } from '@/application/collections/';
import { OperatingSystem } from '@/domain/OperatingSystem';
import type { CategoryCollectionParser } from '@/application/Parser/CategoryCollectionParser';
import { CategoryCollectionStub } from './CategoryCollectionStub';

export class CategoryCollectionParserStub {
  public readonly arguments = new Array<{
    data: CollectionData,
    projectDetails: ProjectDetails,
  }>();

  private readonly returnValues = new Map<CollectionData, ICategoryCollection>();

  public withReturnValue(
    data: CollectionData,
    collection: ICategoryCollection,
  ): this {
    this.returnValues.set(data, collection);
    return this;
  }

  public getStub(): CategoryCollectionParser {
    return (data: CollectionData, projectDetails: ProjectDetails): ICategoryCollection => {
      this.arguments.push({ data, projectDetails });
      const foundReturnValue = this.returnValues.get(data);
      if (foundReturnValue) {
        return foundReturnValue;
      }
      // Get next OS with a unique OS so mock does not result in an invalid app due to duplicated OS
      // collections.
      const currentRun = this.arguments.length - 1;
      const nextOs = getEnumValues(OperatingSystem)[currentRun];
      return new CategoryCollectionStub()
        .withOs(nextOs);
    };
  }
}
