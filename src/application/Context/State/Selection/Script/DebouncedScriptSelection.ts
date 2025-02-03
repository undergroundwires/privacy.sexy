import { InMemoryRepository } from '@/infrastructure/Repository/InMemoryRepository';
import type { Script } from '@/domain/Executables/Script/Script';
import { EventSource } from '@/infrastructure/Events/EventSource';
import type { ReadonlyRepository, Repository } from '@/application/Repository/Repository';
import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import { batchedDebounce } from '@/application/Common/Timing/BatchedDebounce';
import type { ExecutableId } from '@/domain/Executables/Identifiable';
import { UserSelectedScript } from './UserSelectedScript';
import type { ScriptSelection } from './ScriptSelection';
import type { ScriptSelectionChange, ScriptSelectionChangeCommand } from './ScriptSelectionChange';
import type { SelectedScript } from './SelectedScript';

const DEBOUNCE_DELAY_IN_MS = 100;

export type DebounceFunction = typeof batchedDebounce<ScriptSelectionChangeCommand>;

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

  public isSelected(scriptExecutableId: ExecutableId): boolean {
    return this.scripts.exists(scriptExecutableId);
  }

  public get selectedScripts(): readonly SelectedScript[] {
    return this.scripts.getItems();
  }

  public selectAll(): void {
    const scriptsToSelect = this.collection
      .getAllScripts()
      .filter((script) => !this.scripts.exists(script.executableId))
      .map((script) => new UserSelectedScript(script, false));
    if (scriptsToSelect.length === 0) {
      return;
    }
    this.processChanges({
      changes: scriptsToSelect.map((script): ScriptSelectionChange => ({
        scriptId: script.id,
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
    const selectedScriptIds = this.scripts.getItems().map((script) => script.id);
    this.processChanges({
      changes: selectedScriptIds.map((scriptId): ScriptSelectionChange => ({
        scriptId,
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
        ...getScriptIdsToBeDeselected(this.scripts, scripts)
          .map((scriptId): ScriptSelectionChange => ({
            scriptId,
            newStatus: {
              isSelected: false,
            },
          })),
        ...getScriptIdsToBeSelected(this.scripts, scripts)
          .map((scriptId): ScriptSelectionChange => ({
            scriptId,
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
    const script = this.collection.getScript(change.scriptId);
    if (change.newStatus.isSelected) {
      return this.addOrUpdateScript(script.executableId, change.newStatus.isReverted);
    }
    return this.removeScript(script.executableId);
  }

  private addOrUpdateScript(scriptId: ExecutableId, revert: boolean): number {
    const script = this.collection.getScript(scriptId);
    const selectedScript = new UserSelectedScript(script, revert);
    if (!this.scripts.exists(selectedScript.id)) {
      this.scripts.addItem(selectedScript);
      return 1;
    }
    const existingSelectedScript = this.scripts.getById(selectedScript.id);
    if (equals(selectedScript, existingSelectedScript)) {
      return 0;
    }
    this.scripts.addOrUpdateItem(selectedScript);
    return 1;
  }

  private removeScript(scriptId: ExecutableId): number {
    if (!this.scripts.exists(scriptId)) {
      return 0;
    }
    this.scripts.removeItem(scriptId);
    return 1;
  }
}

function assertNonEmptyScriptSelection(selectedItems: readonly Script[]) {
  if (selectedItems.length === 0) {
    throw new Error('Provided script array is empty. To deselect all scripts, please use the deselectAll() method instead.');
  }
}

function getScriptIdsToBeSelected(
  existingItems: ReadonlyRepository<SelectedScript>,
  desiredScripts: readonly Script[],
): string[] {
  return desiredScripts
    .filter((script) => !existingItems.exists(script.executableId))
    .map((script) => script.executableId);
}

function getScriptIdsToBeDeselected(
  existingItems: ReadonlyRepository<SelectedScript>,
  desiredScripts: readonly Script[],
): string[] {
  return existingItems
    .getItems()
    .filter((existing) => !desiredScripts.some((script) => existing.id === script.executableId))
    .map((script) => script.id);
}

function equals(a: SelectedScript, b: SelectedScript): boolean {
  return a.script.executableId === b.script.executableId && a.revert === b.revert;
}
