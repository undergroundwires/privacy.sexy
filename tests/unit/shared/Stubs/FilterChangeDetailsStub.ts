import { FilterActionType } from '@/application/Context/State/Filter/Event/FilterActionType';
import { IFilterChangeDetails, IFilterChangeDetailsVisitor } from '@/application/Context/State/Filter/Event/IFilterChangeDetails';
import { IFilterResult } from '@/application/Context/State/Filter/IFilterResult';

export class FilterChangeDetailsStub implements IFilterChangeDetails {
  public static forApply(filter: IFilterResult) {
    return new FilterChangeDetailsStub(FilterActionType.Apply, filter);
  }

  public static forClear() {
    return new FilterChangeDetailsStub(FilterActionType.Clear);
  }

  private constructor(
    public actionType: FilterActionType,
    public filter?: IFilterResult,
  ) { /* Private constructor to enforce factory methods */ }

  visit(visitor: IFilterChangeDetailsVisitor): void {
    if (this.filter) {
      visitor.onApply(this.filter);
    } else {
      visitor.onClear();
    }
  }
}
