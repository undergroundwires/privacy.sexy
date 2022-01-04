import { InMemoryRepository } from '@/infrastructure/Repository/InMemoryRepository';
import { IScript } from '@/domain/IScript';
import { EventSource } from '@/infrastructure/Events/EventSource';
import { IRepository } from '@/infrastructure/Repository/IRepository';
import { ICategory } from '@/domain/ICategory';
import { ICategoryCollection } from '@/domain/ICategoryCollection';
import { IUserSelection } from './IUserSelection';
import { SelectedScript } from './SelectedScript';

export class UserSelection implements IUserSelection {
  public readonly changed = new EventSource<ReadonlyArray<SelectedScript>>();

  private readonly scripts: IRepository<string, SelectedScript>;

  constructor(
    private readonly collection: ICategoryCollection,
    selectedScripts: ReadonlyArray<SelectedScript>,
  ) {
    this.scripts = new InMemoryRepository<string, SelectedScript>();
    for (const script of selectedScripts) {
      this.scripts.addItem(script);
    }
  }

  public areAllSelected(category: ICategory): boolean {
    if (this.selectedScripts.length === 0) {
      return false;
    }
    const scripts = category.getAllScriptsRecursively();
    if (this.selectedScripts.length < scripts.length) {
      return false;
    }
    return scripts.every(
      (script) => this.selectedScripts.some((selected) => selected.id === script.id),
    );
  }

  public isAnySelected(category: ICategory): boolean {
    if (this.selectedScripts.length === 0) {
      return false;
    }
    return this.selectedScripts.some((s) => category.includes(s.script));
  }

  public removeAllInCategory(categoryId: number): void {
    const category = this.collection.findCategory(categoryId);
    const scriptsToRemove = category.getAllScriptsRecursively()
      .filter((script) => this.scripts.exists(script.id));
    if (!scriptsToRemove.length) {
      return;
    }
    for (const script of scriptsToRemove) {
      this.scripts.removeItem(script.id);
    }
    this.changed.notify(this.scripts.getItems());
  }

  public addOrUpdateAllInCategory(categoryId: number, revert = false): void {
    const scriptsToAddOrUpdate = this.collection
      .findCategory(categoryId)
      .getAllScriptsRecursively()
      .filter(
        (script) => !this.scripts.exists(script.id)
          || this.scripts.getById(script.id).revert !== revert,
      )
      .map((script) => new SelectedScript(script, revert));
    if (!scriptsToAddOrUpdate.length) {
      return;
    }
    for (const script of scriptsToAddOrUpdate) {
      this.scripts.addOrUpdateItem(script);
    }
    this.changed.notify(this.scripts.getItems());
  }

  public addSelectedScript(scriptId: string, revert: boolean): void {
    const script = this.collection.findScript(scriptId);
    if (!script) {
      throw new Error(`Cannot add (id: ${scriptId}) as it is unknown`);
    }
    const selectedScript = new SelectedScript(script, revert);
    this.scripts.addItem(selectedScript);
    this.changed.notify(this.scripts.getItems());
  }

  public addOrUpdateSelectedScript(scriptId: string, revert: boolean): void {
    const script = this.collection.findScript(scriptId);
    const selectedScript = new SelectedScript(script, revert);
    this.scripts.addOrUpdateItem(selectedScript);
    this.changed.notify(this.scripts.getItems());
  }

  public removeSelectedScript(scriptId: string): void {
    this.scripts.removeItem(scriptId);
    this.changed.notify(this.scripts.getItems());
  }

  public isSelected(scriptId: string): boolean {
    return this.scripts.exists(scriptId);
  }

  /** Get users scripts based on his/her selections */
  public get selectedScripts(): ReadonlyArray<SelectedScript> {
    return this.scripts.getItems();
  }

  public selectAll(): void {
    const scriptsToSelect = this.collection
      .getAllScripts()
      .filter((script) => !this.scripts.exists(script.id))
      .map((script) => new SelectedScript(script, false));
    for (const script of scriptsToSelect) {
      this.scripts.addItem(script);
    }
    this.changed.notify(this.scripts.getItems());
  }

  public deselectAll(): void {
    const selectedScriptIds = this.scripts.getItems().map((script) => script.id);
    for (const scriptId of selectedScriptIds) {
      this.scripts.removeItem(scriptId);
    }
    this.changed.notify([]);
  }

  public selectOnly(scripts: readonly IScript[]): void {
    if (!scripts || scripts.length === 0) {
      throw new Error('Scripts are empty. Use deselectAll() if you want to deselect everything');
    }
    // Unselect from selected scripts
    if (this.scripts.length !== 0) {
      this.scripts.getItems()
        .filter((existing) => !scripts.some((script) => existing.id === script.id))
        .map((script) => script.id)
        .forEach((scriptId) => this.scripts.removeItem(scriptId));
    }
    // Select from unselected scripts
    const unselectedScripts = scripts
      .filter((script) => !this.scripts.exists(script.id))
      .map((script) => new SelectedScript(script, false));
    for (const toSelect of unselectedScripts) {
      this.scripts.addItem(toSelect);
    }
    this.changed.notify(this.scripts.getItems());
  }
}
