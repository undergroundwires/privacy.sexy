import type { CollectionsLoader } from '@/application/Application/Loader/Collections/CollectionsLoader';
import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import { CategoryCollectionStub } from '@tests/unit/shared/Stubs/CategoryCollectionStub';

export class CollectionsLoaderStub {
  public callHistory = new Array<Parameters<CollectionsLoader>>();

  private result: CategoryCollection[] = [new CategoryCollectionStub()];

  public withResult(
    result: CategoryCollection[],
  ): this {
    this.result = result;
    return this;
  }

  public stub(): CollectionsLoader {
    return (...args) => {
      this.callHistory.push(args);
      return this.result;
    };
  }
}
