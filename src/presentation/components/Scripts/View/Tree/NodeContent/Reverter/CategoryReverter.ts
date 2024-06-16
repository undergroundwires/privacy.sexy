import type { UserSelection } from '@/application/Context/State/Selection/UserSelection';
<<<<<<< HEAD
import type { ICategoryCollection } from '@/domain/Collection/ICategoryCollection';
import type { SelectedScript } from '@/application/Context/State/Selection/Script/SelectedScript';
import type { ExecutableId } from '@/domain/Executables/Identifiable/Identifiable';
import { createExecutableIdFromNodeId } from '../../TreeViewAdapter/CategoryNodeMetadataConverter';
=======
import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import type { SelectedScript } from '@/application/Context/State/Selection/Script/SelectedScript';
import type { ExecutableKey } from '@/domain/Executables/ExecutableKey/ExecutableKey';
>>>>>>> cbea6fa3 (Add unique script/category IDs $49, $59, $262, $126)
import { ScriptReverter } from './ScriptReverter';
import type { Reverter } from './Reverter';
import type { TreeNodeId } from '../../TreeView/Node/TreeNode';

export class CategoryReverter implements Reverter {
<<<<<<< HEAD
  private readonly categoryId: ExecutableId;

  private readonly scriptReverters: ReadonlyArray<ScriptReverter>;

  constructor(nodeId: TreeNodeId, collection: ICategoryCollection) {
    this.categoryId = createExecutableIdFromNodeId(nodeId);
    this.scriptReverters = createScriptReverters(this.categoryId, collection);
=======
  private readonly scriptReverters: ReadonlyArray<ScriptReverter>;

  constructor(
    private readonly categoryKey: ExecutableKey,
    collection: CategoryCollection,
  ) {
    this.scriptReverters = createScriptReverters(this.categoryKey, collection);
>>>>>>> cbea6fa3 (Add unique script/category IDs $49, $59, $262, $126)
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
        categoryKey: this.categoryKey,
        newStatus: {
          isSelected: true,
          isReverted: newState,
        },
      }],
    });
  }
}

function createScriptReverters(
<<<<<<< HEAD
  categoryId: ExecutableId,
  collection: ICategoryCollection,
=======
  categoryKey: ExecutableKey,
  collection: CategoryCollection,
>>>>>>> cbea6fa3 (Add unique script/category IDs $49, $59, $262, $126)
): ScriptReverter[] {
  const category = collection.getCategory(categoryKey.executableId);
  const scripts = category
    .getAllScriptsRecursively()
    .filter((script) => script.canRevert());
<<<<<<< HEAD
  return scripts.map((script) => new ScriptReverter(script.executableId));
=======
  return scripts.map((script) => new ScriptReverter(script.key));
>>>>>>> cbea6fa3 (Add unique script/category IDs $49, $59, $262, $126)
}
