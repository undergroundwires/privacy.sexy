import { UserSelection } from '@/application/Context/State/Selection/UserSelection';
import { ICategoryCollection } from '@/domain/ICategoryCollection';
import { SelectedScript } from '@/application/Context/State/Selection/Script/SelectedScript';
import { getCategoryId } from '../../TreeViewAdapter/CategoryNodeMetadataConverter';
import { Reverter } from './Reverter';
import { ScriptReverter } from './ScriptReverter';

export class CategoryReverter implements Reverter {
  private readonly categoryId: number;

  private readonly scriptReverters: ReadonlyArray<ScriptReverter>;

  constructor(nodeId: string, collection: ICategoryCollection) {
    this.categoryId = getCategoryId(nodeId);
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
  categoryId: number,
  collection: ICategoryCollection,
): ScriptReverter[] {
  const category = collection.getCategory(categoryId);
  const scripts = category
    .getAllScriptsRecursively()
    .filter((script) => script.canRevert());
  return scripts.map((script) => new ScriptReverter(script.id));
}
