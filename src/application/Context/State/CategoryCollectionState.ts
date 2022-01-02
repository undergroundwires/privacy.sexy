import { ICategoryCollection } from '@/domain/ICategoryCollection';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { UserFilter } from './Filter/UserFilter';
import { IUserFilter } from './Filter/IUserFilter';
import { ApplicationCode } from './Code/ApplicationCode';
import { UserSelection } from './Selection/UserSelection';
import { IUserSelection } from './Selection/IUserSelection';
import { ICategoryCollectionState } from './ICategoryCollectionState';
import { IApplicationCode } from './Code/IApplicationCode';

export class CategoryCollectionState implements ICategoryCollectionState {
  public readonly os: OperatingSystem;

  public readonly code: IApplicationCode;

  public readonly selection: IUserSelection;

  public readonly filter: IUserFilter;

  public constructor(readonly collection: ICategoryCollection) {
    this.selection = new UserSelection(collection, []);
    this.code = new ApplicationCode(this.selection, collection.scripting);
    this.filter = new UserFilter(collection);
    this.os = collection.os;
  }
}
