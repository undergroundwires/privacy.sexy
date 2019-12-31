import { IApplication } from '@/domain/IApplication';
import { IUserSelection } from './IUserSelection';
import { InMemoryRepository } from '@/infrastructure/Repository/InMemoryRepository';
import { IScript } from '@/domain/Script';
import { Signal } from '@/infrastructure/Events/Signal';

export class UserSelection implements IUserSelection {
    public readonly changed = new Signal<ReadonlyArray<IScript>>();

    private readonly scripts = new InMemoryRepository<string, IScript>();

    constructor(
        private readonly app: IApplication,
        /** Initially selected scripts */
        selectedScripts: ReadonlyArray<IScript>) {
        if (selectedScripts && selectedScripts.length > 0) {
            for (const script of selectedScripts) {
                this.scripts.addItem(script);
            }
        }
    }

    /** Add a script to users application */
    public addSelectedScript(scriptId: string): void {
        const script = this.app.findScript(scriptId);
        if (!script) {
            throw new Error(`Cannot add (id: ${scriptId}) as it is unknown`);
        }
        this.scripts.addItem(script);
        this.changed.notify(this.scripts.getItems());
    }

    /** Remove a script from users application */
    public removeSelectedScript(scriptId: string): void {
        this.scripts.removeItem(scriptId);
        this.changed.notify(this.scripts.getItems());
    }

    public isSelected(script: IScript): boolean {
        return this.scripts.exists(script);
    }

    /** Get users scripts based on his/her selections */
    public get selectedScripts(): ReadonlyArray<IScript> {
        return this.scripts.getItems();
    }

    public get totalSelected(): number {
        return this.scripts.getItems().length;
    }

    public selectAll(): void {
        for (const script of this.app.getAllScripts()) {
            if (!this.scripts.exists(script)) {
                this.scripts.addItem(script);
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
        scripts
            .filter((script) => !this.scripts.exists(script))
            .forEach((script) => this.scripts.addItem(script));
        this.changed.notify(this.scripts.getItems());
    }
}
