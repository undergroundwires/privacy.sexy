import { IFilterResult } from '@/application/Context/State/Filter/IFilterResult';
import { FilterActionType } from './FilterActionType';
import { IFilterChangeDetails, IFilterChangeDetailsVisitor } from './IFilterChangeDetails';

export class FilterChange implements IFilterChangeDetails {
  public static forApply(filter: IFilterResult) {
    if (!filter) {
      throw new Error('missing filter');
    }
    return new FilterChange(FilterActionType.Apply, filter);
  }

  public static forClear() {
    return new FilterChange(FilterActionType.Clear);
  }

  private constructor(
    public readonly actionType: FilterActionType,
    public readonly filter?: IFilterResult,
  ) { }

  public visit(visitor: IFilterChangeDetailsVisitor): void {
    if (!visitor) {
      throw new Error('missing visitor');
    }
    switch (this.actionType) {
      case FilterActionType.Apply:
        visitor.onApply(this.filter);
        break;
      case FilterActionType.Clear:
        visitor.onClear();
        break;
      default:
        throw new Error(`Unknown action type: ${this.actionType}`);
    }
  }
}
