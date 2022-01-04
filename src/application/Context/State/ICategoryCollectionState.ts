import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import { OperatingSystem } from '@/domain/OperatingSystem';
import type { IApplicationCode } from './Code/IApplicationCode';
import type { ReadonlyFilterContext, FilterContext } from './Filter/FilterContext';
import type { ReadonlyUserSelection, UserSelection } from './Selection/UserSelection';

export interface IReadOnlyCategoryCollectionState {
  readonly code: IApplicationCode;
  readonly os: OperatingSystem;
  readonly filter: ReadonlyFilterContext;
  readonly selection: ReadonlyUserSelection;
  readonly collection: CategoryCollection;
}

export interface ICategoryCollectionState extends IReadOnlyCategoryCollectionState {
  readonly filter: FilterContext;
  readonly selection: UserSelection;
}
