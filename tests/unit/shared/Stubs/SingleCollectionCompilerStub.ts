import type { ProjectDetails } from '@/domain/Project/ProjectDetails';
import { getEnumValues } from '@/application/Common/Enum';
import type { CollectionData } from '@/application/collections/';
import { OperatingSystem } from '@/domain/OperatingSystem';
import type { SingleCollectionCompiler } from '@/application/Compiler/Collection/SingleCollectionCompiler';
import { CompiledCollectionDtoStub } from './CompiledCollectionDtoStub';

export class SingleCollectionCompilerStub {
  public readonly callHistory = new Array<{
    readonly collectionData: CollectionData,
    readonly projectDetails: ProjectDetails,
  }>();

  private readonly returnValues = new Map<CollectionData, ReturnType<SingleCollectionCompiler>>();

  public withReturnValue(
    data: CollectionData,
    returnValue: ReturnType<SingleCollectionCompiler>,
  ): this {
    this.returnValues.set(data, returnValue);
    return this;
  }

  public getStub(): SingleCollectionCompiler {
    return (collectionData, projectDetails): ReturnType<SingleCollectionCompiler> => {
      this.callHistory.push({ collectionData, projectDetails });
      const foundReturnValue = this.returnValues.get(collectionData);
      if (foundReturnValue) {
        return foundReturnValue;
      }
      // Get next OS with a unique OS so mock does not result in an invalid app due to duplicated OS
      // collections.
      const currentRun = this.callHistory.length - 1;
      const nextOs = getEnumValues(OperatingSystem)[currentRun];
      return new CompiledCollectionDtoStub()
        .withOs(OperatingSystem[nextOs]);
    };
  }
}
