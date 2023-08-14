import { IFilterResult } from '@/application/Context/State/Filter/IFilterResult';
import { FilterActionType } from './FilterActionType';

export interface IFilterChangeDetails {
  readonly actionType: FilterActionType;
  readonly filter?: IFilterResult;

  visit(visitor: IFilterChangeDetailsVisitor): void;
}

export interface IFilterChangeDetailsVisitor {
  onClear(): void;
  onApply(filter: IFilterResult): void;
}
