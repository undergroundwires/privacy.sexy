import type { IApplicationCode } from '@/application/Context/State/Code/IApplicationCode';
import type { ICategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';
import { OperatingSystem } from '@/domain/OperatingSystem';
import type { Script } from '@/domain/Executables/Script/Script';
import { ScriptStub } from '@tests/unit/shared/Stubs/ScriptStub';
import type { ICategoryCollection } from '@/domain/Collection/ICategoryCollection';
import type { UserSelection } from '@/application/Context/State/Selection/UserSelection';
import type { SelectedScript } from '@/application/Context/State/Selection/Script/SelectedScript';
import type { FilterContext } from '@/application/Context/State/Filter/FilterContext';
import { CategoryCollectionStub } from './CategoryCollectionStub';
import { UserSelectionStub } from './UserSelectionStub';
import { FilterContextStub } from './FilterContextStub';
import { ApplicationCodeStub } from './ApplicationCodeStub';
import { CategoryStub } from './CategoryStub';
import { ScriptSelectionStub } from './ScriptSelectionStub';

export class CategoryCollectionStateStub implements ICategoryCollectionState {
  public code: IApplicationCode = new ApplicationCodeStub();

  public filter: FilterContext = new FilterContextStub();

  public get os(): OperatingSystem {
    return this.collection.os;
  }

  public collection: ICategoryCollection = new CategoryCollectionStub().withSomeActions();

  public selection: UserSelection = new UserSelectionStub();

  constructor(readonly allScripts: Script[] = [new ScriptStub('script-id')]) {
    this.selection = new UserSelectionStub()
      .withScripts(new ScriptSelectionStub());
    this.collection = new CategoryCollectionStub()
      .withOs(this.os)
      .withTotalScripts(this.allScripts.length)
      .withAction(
        new CategoryStub(`[${CategoryCollectionStateStub.name}]-default-action`)
          .withScripts(...allScripts),
      );
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

  public withFilter(filter: FilterContext): this {
    this.filter = filter;
    return this;
  }

  public withSelectedScripts(initialScripts: readonly SelectedScript[]): this {
    return this.withSelection(
      new UserSelectionStub().withScripts(
        new ScriptSelectionStub()
          .withSelectedScripts(initialScripts),
      ),
    );
  }

  public withSelection(selection: UserSelection): this {
    this.selection = selection;
    return this;
  }
}
