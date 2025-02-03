import type { FilterResult } from '@/application/Context/State/Filter/Result/FilterResult';
import type { FilterStrategy } from '@/application/Context/State/Filter/Strategy/FilterStrategy';
import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import { FilterResultStub } from './FilterResultStub';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';

export class FilterStrategyStub
  extends StubWithObservableMethodCalls<FilterStrategy>
  implements FilterStrategy {
  private predeterminedResult: FilterResult = new FilterResultStub();

  public applyFilter(filter: string, collection: CategoryCollection): FilterResult {
    this.registerMethodCall({
      methodName: 'applyFilter',
      args: [filter, collection],
    });
    return this.predeterminedResult;
  }

  public withApplyFilterResult(predeterminedResult: FilterResult): this {
    this.predeterminedResult = predeterminedResult;
    return this;
  }
}
