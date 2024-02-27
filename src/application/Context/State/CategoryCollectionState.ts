import type { ICategoryCollection } from '@/domain/ICategoryCollection';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { AdaptiveFilterContext } from './Filter/AdaptiveFilterContext';
import { ApplicationCode } from './Code/ApplicationCode';
import { UserSelectionFacade } from './Selection/UserSelectionFacade';
import type { FilterContext } from './Filter/FilterContext';
import type { UserSelection } from './Selection/UserSelection';
import type { ICategoryCollectionState } from './ICategoryCollectionState';
import type { IApplicationCode } from './Code/IApplicationCode';

export class CategoryCollectionState implements ICategoryCollectionState {
  public readonly os: OperatingSystem;

  public readonly code: IApplicationCode;

  public readonly selection: UserSelection;

  public readonly filter: FilterContext;

  public constructor(
    public readonly collection: ICategoryCollection,
    selectionFactory = DefaultSelectionFactory,
    codeFactory = DefaultCodeFactory,
    filterFactory = DefaultFilterFactory,
  ) {
    this.selection = selectionFactory(collection, []);
    this.code = codeFactory(this.selection.scripts, collection.scripting);
    this.filter = filterFactory(collection);
    this.os = collection.os;
  }
}

export type CodeFactory = (
  ...params: ConstructorParameters<typeof ApplicationCode>
) => IApplicationCode;

const DefaultCodeFactory: CodeFactory = (...params) => new ApplicationCode(...params);

export type SelectionFactory = (
  ...params: ConstructorParameters<typeof UserSelectionFacade>
) => UserSelection;

const DefaultSelectionFactory: SelectionFactory = (
  ...params
) => new UserSelectionFacade(...params);

export type FilterFactory = (
  ...params: ConstructorParameters<typeof AdaptiveFilterContext>
) => FilterContext;

const DefaultFilterFactory: FilterFactory = (...params) => new AdaptiveFilterContext(...params);
