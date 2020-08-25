import { SelectedScript } from './SelectedScript';
import { IApplication } from '@/domain/IApplication';
import { IUserSelection } from './IUserSelection';
import { InMemoryRepository } from '@/infrastructure/Repository/InMemoryRepository';
import { IScript } from '@/domain/IScript';
import { Signal } from '@/infrastructure/Events/Signal';
import { IRepository } from '@/infrastructure/Repository/IRepository';

export class UserSelection implements IUserSelection {
    public readonly changed = new Signal<ReadonlyArray<SelectedScript>>();
    private readonly scripts: IRepository<string, SelectedScript>;

    constructor(
        private readonly app: IApplication,
        /** Initially selected scripts */
        selectedScripts: ReadonlyArray<IScript>) {
        this.scripts =  new InMemoryRepository<string, SelectedScript>();
        if (selectedScripts && selectedScripts.length > 0) {
            for (const script of selectedScripts) {
                const selected = new SelectedScript(script, false);
                this.scripts.addItem(selected);
            }
        }
    }

    public removeAllInCategory(categoryId: number): void {
        const category = this.app.findCategory(categoryId);
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

    public addAllInCategory(categoryId: number): void {
        const category = this.app.findCategory(categoryId);
        const scriptsToAdd = category.getAllScriptsRecursively()
            .filter((script) => !this.scripts.exists(script.id));
        if (!scriptsToAdd.length) {
            return;
        }
        for (const script of scriptsToAdd) {
            const selectedScript = new SelectedScript(script, false);
            this.scripts.addItem(selectedScript);
        }
        this.changed.notify(this.scripts.getItems());
    }

    public addSelectedScript(scriptId: string, revert: boolean): void {
        const script = this.app.findScript(scriptId);
        if (!script) {
            throw new Error(`Cannot add (id: ${scriptId}) as it is unknown`);
        }
        const selectedScript = new SelectedScript(script, revert);
        this.scripts.addItem(selectedScript);
        this.changed.notify(this.scripts.getItems());
    }

    public addOrUpdateSelectedScript(scriptId: string, revert: boolean): void {
        const script = this.app.findScript(scriptId);
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

    public get totalSelected(): number {
        return this.scripts.getItems().length;
    }

    public selectAll(): void {
        for (const script of this.app.getAllScripts()) {
            if (!this.scripts.exists(script.id)) {
                const selection = new SelectedScript(script, false);
                this.scripts.addItem(selection);
            }
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
        const unselectedScripts = scripts.filter((script) => !this.scripts.exists(script.id));
        for (const toSelect of unselectedScripts) {
            const selection = new SelectedScript(toSelect, false);
            this.scripts.addItem(selection);
        }
        this.changed.notify(this.scripts.getItems());
    }
}
