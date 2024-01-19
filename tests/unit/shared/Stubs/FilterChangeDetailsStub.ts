import { FilterActionType } from '@/application/Context/State/Filter/Event/FilterActionType';
import { FilterAction, IFilterChangeDetails, IFilterChangeDetailsVisitor } from '@/application/Context/State/Filter/Event/IFilterChangeDetails';
import { IFilterResult } from '@/application/Context/State/Filter/IFilterResult';

export class FilterChangeDetailsStub implements IFilterChangeDetails {
  public static forApply(filter: IFilterResult) {
    return new FilterChangeDetailsStub({
      type: FilterActionType.Apply,
      filter,
    });
  }

  public static forClear() {
    return new FilterChangeDetailsStub({
      type: FilterActionType.Clear,
    });
  }

  private constructor(
    public readonly action: FilterAction,
  ) { /* Private constructor to enforce factory methods */ }

  visit(visitor: IFilterChangeDetailsVisitor): void {
    if (this.action.type === FilterActionType.Apply) {
      if (visitor.onApply) {
        visitor.onApply(this.action.filter);
      }
    }
    if (this.action.type === FilterActionType.Clear) {
      if (visitor.onClear) {
        visitor.onClear();
      }
    }
  }
}
