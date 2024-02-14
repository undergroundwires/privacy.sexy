import { ICategoryCollection } from '@/domain/ICategoryCollection';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { ReadonlyFilterContext, FilterContext } from './Filter/FilterContext';
import { ReadonlyUserSelection, UserSelection } from './Selection/UserSelection';
import { IApplicationCode } from './Code/IApplicationCode';

export interface IReadOnlyCategoryCollectionState {
  readonly code: IApplicationCode;
  readonly os: OperatingSystem;
  readonly filter: ReadonlyFilterContext;
  readonly selection: ReadonlyUserSelection;
  readonly collection: ICategoryCollection;
}

export interface ICategoryCollectionState extends IReadOnlyCategoryCollectionState {
  readonly filter: FilterContext;
  readonly selection: UserSelection;
}
