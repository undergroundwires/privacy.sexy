import type { ProjectDetails } from '@/domain/Project/ProjectDetails';
import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import { getEnumValues } from '@/application/Common/Enum';
import type { CollectionData } from '@/application/collections/';
import { OperatingSystem } from '@/domain/OperatingSystem';
import type { CollectionCompiler } from '@/application/Application/Loader/Collections/Compiler/CollectionCompiler';
import { CategoryCollectionStub } from './CategoryCollectionStub';

export class CollectionCompilerStub {
  public readonly callHistory = new Array<{
    readonly data: CollectionData,
    readonly projectDetails: ProjectDetails,
  }>();

  private readonly returnValues = new Map<CollectionData, CategoryCollection>();

  private sequentialReturnValues: readonly CategoryCollection[] = [];

  public withReturnValue(
    data: CollectionData,
    collection: CategoryCollection,
  ): this {
    this.returnValues.set(data, collection);
    return this;
  }

  public withSequentialReturnValues(
    sequentialReturnValues: readonly CategoryCollection[],
  ): this {
    this.sequentialReturnValues = sequentialReturnValues;
    return this;
  }

  public stub(): CollectionCompiler {
    return (data: CollectionData, projectDetails: ProjectDetails): CategoryCollection => {
      const totalCallsBeforeThis = this.callHistory.length;
      this.callHistory.push({ data, projectDetails });
      const foundReturnValue = this.returnValues.get(data);
      if (foundReturnValue) {
        return foundReturnValue;
      }
      if (
        this.sequentialReturnValues.length > 0
        && totalCallsBeforeThis < this.sequentialReturnValues.length
      ) {
        return this.sequentialReturnValues[totalCallsBeforeThis];
      }
      // Get next OS with a unique OS so mock does not result in an invalid app due to duplicated OS
      // collections.
      const allOperatingSystems = getEnumValues(OperatingSystem);
      const nextOs = allOperatingSystems[
        totalCallsBeforeThis % allOperatingSystems.length
      ];
      return new CategoryCollectionStub()
        .withOs(nextOs);
    };
  }
}
