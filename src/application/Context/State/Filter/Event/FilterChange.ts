import { IFilterResult } from '@/application/Context/State/Filter/IFilterResult';
import { FilterActionType } from './FilterActionType';
import {
  IFilterChangeDetails, IFilterChangeDetailsVisitor,
  ApplyFilterAction, ClearFilterAction,
} from './IFilterChangeDetails';

export class FilterChange implements IFilterChangeDetails {
  public static forApply(
    filter: IFilterResult,
  ): IFilterChangeDetails {
    return new FilterChange({ type: FilterActionType.Apply, filter });
  }

  public static forClear(): IFilterChangeDetails {
    return new FilterChange({ type: FilterActionType.Clear });
  }

  private constructor(public readonly action: ApplyFilterAction | ClearFilterAction) { }

  public visit(visitor: IFilterChangeDetailsVisitor): void {
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
