import type { FilterResult } from '@/application/Context/State/Filter/Result/FilterResult';
import type { FilterActionType } from './FilterActionType';

export interface FilterChangeDetails {
  readonly action: FilterAction;
  visit(visitor: FilterChangeDetailsVisitor): void;
}

export interface FilterChangeDetailsVisitor {
  readonly onClear?: () => void;
  readonly onApply?: (filter: FilterResult) => void;
}

export type ApplyFilterAction = {
  readonly type: FilterActionType.Apply,
  readonly filter: FilterResult;
};

export type ClearFilterAction = {
  readonly type: FilterActionType.Clear,
};

export type FilterAction = ApplyFilterAction | ClearFilterAction;
