import { IApplicationCode } from '@/application/Context/State/Code/IApplicationCode';
import { IUserFilter } from '@/application/Context/State/Filter/IUserFilter';
import { ICategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { SelectedScript } from '@/application/Context/State/Selection/SelectedScript';
import { IScript } from '@/domain/IScript';
import { ScriptStub } from '@tests/unit/shared/Stubs/ScriptStub';
import { ICategoryCollection } from '@/domain/ICategoryCollection';
import { IUserSelection } from '@/application/Context/State/Selection/IUserSelection';
import { CategoryCollectionStub } from './CategoryCollectionStub';
import { UserSelectionStub } from './UserSelectionStub';
import { UserFilterStub } from './UserFilterStub';
import { ApplicationCodeStub } from './ApplicationCodeStub';
import { CategoryStub } from './CategoryStub';

export class CategoryCollectionStateStub implements ICategoryCollectionState {
  public code: IApplicationCode = new ApplicationCodeStub();

  public filter: IUserFilter = new UserFilterStub();

  public get os(): OperatingSystem {
    return this.collection.os;
  }

  public collection: ICategoryCollection = new CategoryCollectionStub().withSomeActions();

  public selection: IUserSelection = new UserSelectionStub([]);

  constructor(readonly allScripts: IScript[] = [new ScriptStub('script-id')]) {
    this.selection = new UserSelectionStub(allScripts);
    this.collection = new CategoryCollectionStub()
      .withOs(this.os)
      .withTotalScripts(this.allScripts.length)
      .withAction(new CategoryStub(0).withScripts(...allScripts));
  }

  public withCollection(collection: ICategoryCollection): this {
    this.collection = collection;
    return this;
  }

  public withCode(code: IApplicationCode): this {
    this.code = code;
    return this;
  }

  public withOs(os: OperatingSystem): this {
    if (this.collection instanceof CategoryCollectionStub) {
      this.collection = this.collection.withOs(os);
    } else {
      this.collection = new CategoryCollectionStub().withOs(os);
    }
    return this;
  }

  public withFilter(filter: IUserFilter): this {
    this.filter = filter;
    return this;
  }

  public withSelectedScripts(initialScripts: readonly SelectedScript[]): this {
    return this.withSelection(
      new UserSelectionStub([]).withSelectedScripts(initialScripts),
    );
  }

  public withSelection(selection: IUserSelection) {
    this.selection = selection;
    return this;
  }
}
