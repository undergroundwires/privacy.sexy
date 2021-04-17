import { IApplicationCode } from '@/application/Context/State/Code/IApplicationCode';
import { IUserFilter } from '@/application/Context/State/Filter/IUserFilter';
import { ICategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { CategoryCollectionStub } from './CategoryCollectionStub';
import { UserSelectionStub } from './UserSelectionStub';
import { UserFilterStub } from './UserFilterStub';
import { ApplicationCodeStub } from './ApplicationCodeStub';
import { SelectedScript } from '@/application/Context/State/Selection/SelectedScript';
import { IScript } from '@/domain/IScript';
import { CategoryStub } from './CategoryStub';

export class CategoryCollectionStateStub implements ICategoryCollectionState {
    public readonly code: IApplicationCode = new ApplicationCodeStub();
    public readonly filter: IUserFilter = new UserFilterStub();
    public readonly os = OperatingSystem.Windows;
    public readonly collection: CategoryCollectionStub;
    public readonly selection: UserSelectionStub;
    constructor(readonly allScripts: IScript[]) {
        this.selection = new UserSelectionStub(allScripts);
        this.collection = new CategoryCollectionStub()
            .withOs(this.os)
            .withTotalScripts(this.allScripts.length)
            .withAction(new CategoryStub(0).withScripts(...allScripts));
    }
    public withSelectedScripts(initialScripts: readonly SelectedScript[]) {
        this.selection.withSelectedScripts(initialScripts);
        return this;
    }
}
