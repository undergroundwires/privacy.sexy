import type { UserSelection } from '@/application/Context/State/Selection/UserSelection';
import type { ICategoryCollection } from '@/domain/Collection/ICategoryCollection';
import type { SelectedScript } from '@/application/Context/State/Selection/Script/SelectedScript';
import type { ExecutableId } from '@/domain/Executables/Identifiable';
import { createExecutableIdFromNodeId } from '../../TreeViewAdapter/CategoryNodeMetadataConverter';
import { ScriptReverter } from './ScriptReverter';
import type { Reverter } from './Reverter';
import type { TreeNodeId } from '../../TreeView/Node/TreeNode';

export class CategoryReverter implements Reverter {
  private readonly categoryId: ExecutableId;

  private readonly scriptReverters: ReadonlyArray<ScriptReverter>;

  constructor(nodeId: TreeNodeId, collection: ICategoryCollection) {
    this.categoryId = createExecutableIdFromNodeId(nodeId);
    this.scriptReverters = createScriptReverters(this.categoryId, collection);
  }

  public getState(selectedScripts: ReadonlyArray<SelectedScript>): boolean {
    if (!this.scriptReverters.length) {
      // An empty array indicates there are no reversible scripts in this category
      return false;
    }
    return this.scriptReverters.every((script) => script.getState(selectedScripts));
  }

  public selectWithRevertState(newState: boolean, selection: UserSelection): void {
    selection.categories.processChanges({
      changes: [{
        categoryId: this.categoryId,
        newStatus: {
          isSelected: true,
          isReverted: newState,
        },
      }],
    });
  }
}

function createScriptReverters(
  categoryId: ExecutableId,
  collection: ICategoryCollection,
): ScriptReverter[] {
  const category = collection.getCategory(categoryId);
  const scripts = category
    .getAllScriptsRecursively()
    .filter((script) => script.canRevert());
  return scripts.map((script) => new ScriptReverter(script.executableId));
}
