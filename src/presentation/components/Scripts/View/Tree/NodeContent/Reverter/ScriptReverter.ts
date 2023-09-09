import { SelectedScript } from '@/application/Context/State/Selection/SelectedScript';
import { IUserSelection } from '@/application/Context/State/Selection/IUserSelection';
import { getScriptId } from '../../TreeViewAdapter/CategoryNodeMetadataConverter';
import { IReverter } from './IReverter';

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
