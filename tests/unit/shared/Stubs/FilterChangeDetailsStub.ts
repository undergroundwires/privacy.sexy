import { FilterActionType } from '@/application/Context/State/Filter/Event/FilterActionType';
import type { FilterAction, FilterChangeDetails, FilterChangeDetailsVisitor } from '@/application/Context/State/Filter/Event/FilterChangeDetails';
import type { FilterResult } from '@/application/Context/State/Filter/Result/FilterResult';

export class FilterChangeDetailsStub implements FilterChangeDetails {
  public static forApply(filter: FilterResult) {
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

  visit(visitor: FilterChangeDetailsVisitor): void {
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
