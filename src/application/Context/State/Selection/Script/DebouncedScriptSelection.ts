import { InMemoryRepository } from '@/infrastructure/Repository/InMemoryRepository';
import { IScript } from '@/domain/IScript';
import { EventSource } from '@/infrastructure/Events/EventSource';
import { ReadonlyRepository, Repository } from '@/application/Repository/Repository';
import { ICategoryCollection } from '@/domain/ICategoryCollection';
import { batchedDebounce } from '@/application/Common/Timing/BatchedDebounce';
import { ScriptSelection } from './ScriptSelection';
import { ScriptSelectionChange, ScriptSelectionChangeCommand } from './ScriptSelectionChange';
import { SelectedScript } from './SelectedScript';
import { UserSelectedScript } from './UserSelectedScript';

const DEBOUNCE_DELAY_IN_MS = 100;

export type DebounceFunction = typeof batchedDebounce<ScriptSelectionChangeCommand>;

export class DebouncedScriptSelection implements ScriptSelection {
  public readonly changed = new EventSource<ReadonlyArray<SelectedScript>>();

  private readonly scripts: Repository<string, SelectedScript>;

  public readonly processChanges: ScriptSelection['processChanges'];

  constructor(
    private readonly collection: ICategoryCollection,
    selectedScripts: ReadonlyArray<SelectedScript>,
    debounce: DebounceFunction = batchedDebounce,
  ) {
    this.scripts = new InMemoryRepository<string, SelectedScript>();
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

  public isSelected(scriptId: string): boolean {
    return this.scripts.exists(scriptId);
  }

  public get selectedScripts(): readonly SelectedScript[] {
    return this.scripts.getItems();
  }

  public selectAll(): void {
    const scriptsToSelect = this.collection
      .getAllScripts()
      .filter((script) => !this.scripts.exists(script.id))
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

  public selectOnly(scripts: readonly IScript[]): void {
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
      return this.addOrUpdateScript(script.id, change.newStatus.isReverted);
    }
    return this.removeScript(script.id);
  }

  private addOrUpdateScript(scriptId: string, revert: boolean): number {
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

  private removeScript(scriptId: string): number {
    if (!this.scripts.exists(scriptId)) {
      return 0;
    }
    this.scripts.removeItem(scriptId);
    return 1;
  }
}

function assertNonEmptyScriptSelection(selectedItems: readonly IScript[]) {
  if (selectedItems.length === 0) {
    throw new Error('Provided script array is empty. To deselect all scripts, please use the deselectAll() method instead.');
  }
}

function getScriptIdsToBeSelected(
  existingItems: ReadonlyRepository<string, SelectedScript>,
  desiredScripts: readonly IScript[],
): string[] {
  return desiredScripts
    .filter((script) => !existingItems.exists(script.id))
    .map((script) => script.id);
}

function getScriptIdsToBeDeselected(
  existingItems: ReadonlyRepository<string, SelectedScript>,
  desiredScripts: readonly IScript[],
): string[] {
  return existingItems
    .getItems()
    .filter((existing) => !desiredScripts.some((script) => existing.id === script.id))
    .map((script) => script.id);
}

function equals(a: SelectedScript, b: SelectedScript): boolean {
  return a.script.equals(b.script.id) && a.revert === b.revert;
}
