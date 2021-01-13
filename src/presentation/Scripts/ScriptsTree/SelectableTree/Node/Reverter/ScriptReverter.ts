import { IReverter } from './IReverter';
import { getScriptId } from '../../../ScriptNodeParser';
import { SelectedScript } from '@/application/Context/State/Selection/SelectedScript';
import { IUserSelection } from '@/application/Context/State/Selection/IUserSelection';

export class ScriptReverter implements IReverter {
    private readonly scriptId: string;
    constructor(nodeId: string) {
        this.scriptId = getScriptId(nodeId);
    }
    public getState(selectedScripts: ReadonlyArray<SelectedScript>): boolean {
        const selectedScript = selectedScripts.find((selected) => selected.id === this.scriptId);
        if (!selectedScript) {
            return false;
        }
        return selectedScript.revert;
    }
    public selectWithRevertState(newState: boolean, selection: IUserSelection): void {
        selection.addOrUpdateSelectedScript(this.scriptId, newState);
    }
}
