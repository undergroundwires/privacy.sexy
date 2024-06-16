import { InMemoryRepository } from '@/infrastructure/Repository/InMemoryRepository';
import type { Script } from '@/domain/Executables/Script/Script';
import { EventSource } from '@/infrastructure/Events/EventSource';
import type { ReadonlyRepository, Repository } from '@/application/Repository/Repository';
import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import { batchedDebounce } from '@/application/Common/Timing/BatchedDebounce';
import type { ExecutableId, ExecutableKey } from '@/domain/Executables/Identifiable/ExecutableKey/ExecutableKey';
import { UserSelectedScript } from './UserSelectedScript';
import type { ScriptSelection } from './ScriptSelection';
import type { ScriptSelectionChange, ScriptSelectionChangeCommand } from './ScriptSelectionChange';
import type { SelectedScript } from './SelectedScript';

const DEBOUNCE_DELAY_IN_MS = 100;

export type DebounceFunction = typeof batchedDebounce<ScriptSelectionChangeCommand>;

// TODO: Unit tests, naming

export class DebouncedScriptSelection implements ScriptSelection {
  public readonly changed = new EventSource<ReadonlyArray<SelectedScript>>();

  private readonly scripts: Repository<SelectedScript>;

  public readonly processChanges: ScriptSelection['processChanges'];

  constructor(
    private readonly collection: CategoryCollection,
    selectedScripts: ReadonlyArray<SelectedScript>,
    debounce: DebounceFunction = batchedDebounce,
  ) {
    this.scripts = new InMemoryRepository<SelectedScript>();
    for (const script of selectedScripts) {
      this.scripts.addItem(script);
    }
    this.processChanges = debounce(
      (batchedRequests: readonly ScriptSelectionChangeCommand[]) => {
        const consolidatedChanges = batchedRequests.flatMap((request) => request.changes);
        this.processScriptChanges(consolidatedChanges);
      },
      DEBOUNCE_DELAY_IN_MS,
    );
  }

  public isSelected(scriptId: ExecutableId): boolean {
    return this.scripts.exists(this.getExecutableKey(scriptId));
  }

  public get selectedScripts(): readonly SelectedScript[] {
    return this.scripts.getItems();
  }

  public selectAll(): void {
    const scriptsToSelect = this.collection
      .getAllScripts()
      .filter((script) => !this.scripts.exists(script.key))
      .map((script) => new UserSelectedScript(script, false));
    if (scriptsToSelect.length === 0) {
      return;
    }
    this.processChanges({
      changes: scriptsToSelect.map((script): ScriptSelectionChange => ({
        scriptKey: script.key,
        newStatus: {
          isSelected: true,
          isReverted: false,
        },
      })),
    });
  }

  public deselectAll(): void {
    if (this.scripts.length === 0) {
      return;
    }
    const selectedScriptKeys = this.scripts.getItems().map((script) => script.key);
    this.processChanges({
      changes: selectedScriptKeys.map((key): ScriptSelectionChange => ({
        scriptKey: key,
        newStatus: {
          isSelected: false,
        },
      })),
    });
  }

  public selectOnly(scripts: readonly Script[]): void {
    assertNonEmptyScriptSelection(scripts);
    this.processChanges({
      changes: [
        ...getScriptKeysToBeDeselected(this.scripts, scripts)
          .map((key): ScriptSelectionChange => ({
            scriptKey: key,
            newStatus: {
              isSelected: false,
            },
          })),
        ...getScriptKeysToBeSelected(this.scripts, scripts)
          .map((key): ScriptSelectionChange => ({
            scriptKey: key,
            newStatus: {
              isSelected: true,
              isReverted: false,
            },
          })),
      ],
    });
  }

  private processScriptChanges(changes: readonly ScriptSelectionChange[]): void {
    let totalChanged = 0;
    for (const change of changes) {
      totalChanged += this.applyChange(change);
    }
    if (totalChanged > 0) {
      this.changed.notify(this.scripts.getItems());
    }
  }

  private applyChange(change: ScriptSelectionChange): number {
    if (change.newStatus.isSelected) {
      return this.addOrUpdateScript(change.scriptKey, change.newStatus.isReverted);
    }
    return this.removeScript(change.scriptKey);
  }

  private addOrUpdateScript(scriptKey: ExecutableKey, revert: boolean): number {
    const script = this.collection.getScript(scriptKey.executableId);
    const selectedScript = new UserSelectedScript(script, revert);
    if (!this.scripts.exists(selectedScript.key)) {
      this.scripts.addItem(selectedScript);
      return 1;
    }
    const existingSelectedScript = this.scripts.getById(selectedScript.key);
    if (equals(selectedScript, existingSelectedScript)) {
      return 0;
    }
    this.scripts.addOrUpdateItem(selectedScript);
    return 1;
  }

  private removeScript(key: ExecutableKey): number {
    if (!this.scripts.exists(key)) {
      return 0;
    }
    this.scripts.removeItem(key);
    return 1;
  }

  private getExecutableKey(scriptId: ExecutableId): ExecutableKey {
    const script = this.collection.getScript(scriptId);
    return script.key;
  }
}

function assertNonEmptyScriptSelection(selectedItems: readonly Script[]) {
  if (selectedItems.length === 0) {
    throw new Error('Provided script array is empty. To deselect all scripts, please use the deselectAll() method instead.');
  }
}

function getScriptKeysToBeSelected(
  existingItems: ReadonlyRepository<SelectedScript>,
  desiredScripts: readonly Script[],
): ExecutableKey[] {
  return desiredScripts
    .filter((script) => !existingItems.exists(script.key))
    .map((script) => script.key);
}

function getScriptKeysToBeDeselected(
  existingItems: ReadonlyRepository<SelectedScript>,
  desiredScripts: readonly Script[],
): ExecutableKey[] {
  return existingItems
    .getItems()
    .filter((existing) => !desiredScripts.some((script) => existing.key === script.key))
    .map((script) => script.key);
}

function equals(a: SelectedScript, b: SelectedScript): boolean {
  return a.script.key.equals(b.script.key) && a.revert === b.revert;
}
