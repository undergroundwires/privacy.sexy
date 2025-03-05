import type {
  CollectionDataProvider,
} from '@/application/Application/Loader/Collections/DataProvider/CollectionDataProvider';
import type { CollectionData } from '@/application/collections/';
import { CollectionDataStub } from './CollectionDataStub';

export class CollectionDataProviderStub {
  private defaultResult: CollectionData = new CollectionDataStub();

  private sequentialResults: readonly CollectionData[] = [];

  public readonly callHistory = new Array<{ readonly collectionName: string; }>();

  public withDefaultResult(defaultResult: CollectionData): this {
    this.defaultResult = defaultResult;
    return this;
  }

  public withSequentialResults(results: readonly CollectionData[]): this {
    this.sequentialResults = results;
    return this;
  }

  public stub(): CollectionDataProvider {
    return (name) => {
      const totalCallsBeforeThis = this.callHistory.length;
      this.callHistory.push({ collectionName: name });
      if (
        this.sequentialResults.length > 0
        && totalCallsBeforeThis < this.sequentialResults.length
      ) {
        return this.sequentialResults[
          totalCallsBeforeThis % this.sequentialResults.length
        ];
      }
      return this.defaultResult;
    };
  }
}
