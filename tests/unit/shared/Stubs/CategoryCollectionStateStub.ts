import { IApplicationCode } from '@/application/Context/State/Code/IApplicationCode';
import { IUserFilter } from '@/application/Context/State/Filter/IUserFilter';
import { ICategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { SelectedScript } from '@/application/Context/State/Selection/SelectedScript';
import { IScript } from '@/domain/IScript';
import { ScriptStub } from '@tests/unit/shared/Stubs/ScriptStub';
import { ICategoryCollection } from '@/domain/ICategoryCollection';
import { CategoryCollectionStub } from './CategoryCollectionStub';
import { UserSelectionStub } from './UserSelectionStub';
import { UserFilterStub } from './UserFilterStub';
import { ApplicationCodeStub } from './ApplicationCodeStub';
import { CategoryStub } from './CategoryStub';

export class CategoryCollectionStateStub implements ICategoryCollectionState {
  private collectionStub = new CategoryCollectionStub();

  public readonly code: IApplicationCode = new ApplicationCodeStub();

  public filter: IUserFilter = new UserFilterStub();

  public get os(): OperatingSystem {
    return this.collectionStub.os;
  }

  public get collection(): ICategoryCollection {
    return this.collectionStub;
  }

  public readonly selection: UserSelectionStub;

  constructor(readonly allScripts: IScript[] = [new ScriptStub('script-id')]) {
    this.selection = new UserSelectionStub(allScripts);
    this.collectionStub = new CategoryCollectionStub()
      .withOs(this.os)
      .withTotalScripts(this.allScripts.length)
      .withAction(new CategoryStub(0).withScripts(...allScripts));
  }

  public withOs(os: OperatingSystem) {
    this.collectionStub = this.collectionStub.withOs(os);
    return this;
  }

  public withFilter(filter: IUserFilter) {
    this.filter = filter;
    return this;
  }

  public withSelectedScripts(initialScripts: readonly SelectedScript[]) {
    this.selection.withSelectedScripts(initialScripts);
    return this;
  }
}
