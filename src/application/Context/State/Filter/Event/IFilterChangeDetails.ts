import { IFilterResult } from '@/application/Context/State/Filter/IFilterResult';
import { FilterActionType } from './FilterActionType';

export interface IFilterChangeDetails {
  readonly action: FilterAction;
  visit(visitor: IFilterChangeDetailsVisitor): void;
}

export interface IFilterChangeDetailsVisitor {
  readonly onClear?: () => void;
  readonly onApply?: (filter: IFilterResult) => void;
}

export type ApplyFilterAction = {
  readonly type: FilterActionType.Apply,
  readonly filter: IFilterResult;
};

export type ClearFilterAction = {
  readonly type: FilterActionType.Clear,
};

export type FilterAction = ApplyFilterAction | ClearFilterAction;
