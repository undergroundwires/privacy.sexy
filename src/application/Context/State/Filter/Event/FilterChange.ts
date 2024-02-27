import type { FilterResult } from '@/application/Context/State/Filter/Result/FilterResult';
import { FilterActionType } from './FilterActionType';
import type {
  FilterChangeDetails, FilterChangeDetailsVisitor,
  ApplyFilterAction, ClearFilterAction,
} from './FilterChangeDetails';

export class FilterChange implements FilterChangeDetails {
  public static forApply(
    filter: FilterResult,
  ): FilterChangeDetails {
    return new FilterChange({ type: FilterActionType.Apply, filter });
  }

  public static forClear(): FilterChangeDetails {
    return new FilterChange({ type: FilterActionType.Clear });
  }

  private constructor(public readonly action: ApplyFilterAction | ClearFilterAction) { }

  public visit(visitor: FilterChangeDetailsVisitor): void {
    switch (this.action.type) {
      case FilterActionType.Apply:
        if (visitor.onApply) {
          visitor.onApply(this.action.filter);
        }
        break;
      case FilterActionType.Clear:
        if (visitor.onClear) {
          visitor.onClear();
        }
        break;
      default:
        throw new Error(`Unknown action: ${this.action}`);
    }
  }
}
