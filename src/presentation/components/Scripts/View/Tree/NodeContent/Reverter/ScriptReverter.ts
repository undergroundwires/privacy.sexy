import { UserSelection } from '@/application/Context/State/Selection/UserSelection';
import { SelectedScript } from '@/application/Context/State/Selection/Script/SelectedScript';
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

  public selectWithRevertState(newState: boolean, selection: UserSelection): void {
    selection.scripts.processChanges({
      changes: [{
        scriptId: this.scriptId,
        newStatus: {
          isSelected: true,
          isReverted: newState,
        },
      }],
    });
  }
}
