import type { Category } from '@/domain/Executables/Category/Category';
import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import type { ScriptSelection } from '../Script/ScriptSelection';
import type { ScriptSelectionChange } from '../Script/ScriptSelectionChange';
import type { CategorySelection } from './CategorySelection';
import type { CategorySelectionChange, CategorySelectionChangeCommand } from './CategorySelectionChange';

export class ScriptToCategorySelectionMapper implements CategorySelection {
  constructor(
    private readonly scriptSelection: ScriptSelection,
    private readonly collection: CategoryCollection,
  ) {

  }

  public areAllScriptsSelected(category: Category): boolean {
    const { selectedScripts } = this.scriptSelection;
    if (selectedScripts.length === 0) {
      return false;
    }
    const scripts = category.getAllScriptsRecursively();
    if (selectedScripts.length < scripts.length) {
      return false;
    }
    return scripts.every(
      (script) => selectedScripts.some((selected) => selected.id === script.key),
    );
  }

  public isAnyScriptSelected(category: Category): boolean {
    const { selectedScripts } = this.scriptSelection;
    if (selectedScripts.length === 0) {
      return false;
    }
    return selectedScripts.some((s) => category.includes(s.script));
  }

  public processChanges(action: CategorySelectionChangeCommand): void {
    const scriptChanges = action.changes.reduce((changes, change) => {
      changes.push(...this.collectScriptChanges(change));
      return changes;
    }, new Array<ScriptSelectionChange>());
    this.scriptSelection.processChanges({
      changes: scriptChanges,
    });
  }

  private collectScriptChanges(change: CategorySelectionChange): ScriptSelectionChange[] {
    const category = this.collection.getCategory(change.categoryKey.executableId);
    const scripts = category.getAllScriptsRecursively();
    const scriptsChangesInCategory = scripts
      .map((script): ScriptSelectionChange => ({
        scriptKey: script.key,
        newStatus: {
          ...change.newStatus,
        },
      }));
    return scriptsChangesInCategory;
  }
}
