import { IReverter } from './IReverter';
import { getCategoryId } from '../../../ScriptNodeParser';
import { SelectedScript } from '@/application/State/Selection/SelectedScript';
import { IApplication } from '@/domain/IApplication';
import { ScriptReverter } from './ScriptReverter';
import { IUserSelection } from '@/application/State/Selection/IUserSelection';

export class CategoryReverter implements IReverter {
    private readonly categoryId: number;
    private readonly scriptReverters: ReadonlyArray<ScriptReverter>;
    constructor(nodeId: string, app: IApplication) {
        this.categoryId = getCategoryId(nodeId);
        this.scriptReverters = getAllSubScriptReverters(this.categoryId, app);
    }
    public getState(selectedScripts: ReadonlyArray<SelectedScript>): boolean {
        return this.scriptReverters.every((script) => script.getState(selectedScripts));
    }
    public selectWithRevertState(newState: boolean, selection: IUserSelection): void {
        selection.addOrUpdateAllInCategory(this.categoryId, newState);
    }
}

function getAllSubScriptReverters(categoryId: number, app: IApplication) {
    const category = app.findCategory(categoryId);
    if (!category) {
        throw new Error(`Category with id "${categoryId}" does not exist`);
    }
    const scripts = category.getAllScriptsRecursively();
    return scripts.map((script) => new ScriptReverter(script.id));
}
