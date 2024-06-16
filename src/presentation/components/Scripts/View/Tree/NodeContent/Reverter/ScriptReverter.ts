import type { UserSelection } from '@/application/Context/State/Selection/UserSelection';
import type { SelectedScript } from '@/application/Context/State/Selection/Script/SelectedScript';
<<<<<<< HEAD
import { createExecutableIdFromNodeId } from '../../TreeViewAdapter/CategoryNodeMetadataConverter';
import type { Reverter } from './Reverter';

export class ScriptReverter implements Reverter {
  private readonly scriptId: string;

  constructor(nodeId: string) {
    this.scriptId = createExecutableIdFromNodeId(nodeId);
  }
=======
import type { ExecutableKey } from '@/domain/Executables/ExecutableKey/ExecutableKey';
import type { Reverter } from './Reverter';

export class ScriptReverter implements Reverter {
  constructor(
    private readonly scriptKey: ExecutableKey,
  ) { }
>>>>>>> cbea6fa3 (Add unique script/category IDs $49, $59, $262, $126)

  public getState(selectedScripts: ReadonlyArray<SelectedScript>): boolean {
    const selectedScript = selectedScripts.find((selected) => selected.key.equals(this.scriptKey));
    if (!selectedScript) {
      return false;
    }
    return selectedScript.revert;
  }

  public selectWithRevertState(newState: boolean, selection: UserSelection): void {
    selection.scripts.processChanges({
      changes: [{
        scriptKey: this.scriptKey,
        newStatus: {
          isSelected: true,
          isReverted: newState,
        },
      }],
    });
  }
}
