import type { UserSelection } from '@/application/Context/State/Selection/UserSelection';
import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import type { SelectedScript } from '@/application/Context/State/Selection/Script/SelectedScript';
import type { ExecutableKey } from '@/domain/Executables/ExecutableKey/ExecutableKey';
import { ScriptReverter } from './ScriptReverter';
import type { Reverter } from './Reverter';

export class CategoryReverter implements Reverter {
  private readonly scriptReverters: ReadonlyArray<ScriptReverter>;

  constructor(
    private readonly categoryKey: ExecutableKey,
    collection: CategoryCollection,
  ) {
    this.scriptReverters = createScriptReverters(this.categoryKey, collection);
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
  categoryKey: ExecutableKey,
  collection: CategoryCollection,
): ScriptReverter[] {
  const category = collection.getCategory(categoryKey.executableId);
  const scripts = category
    .getAllScriptsRecursively()
    .filter((script) => script.canRevert());
  return scripts.map((script) => new ScriptReverter(script.key));
}
