import { ISignal } from '@/infrastructure/Events/Signal';
import { IScript } from '@/domain/IScript';

export interface IUserSelection {
    readonly changed: ISignal<ReadonlyArray<IScript>>;
    readonly selectedScripts: ReadonlyArray<IScript>;
    readonly totalSelected: number;
    addSelectedScript(scriptId: string): void;
    removeSelectedScript(scriptId: string): void;
    selectOnly(scripts: ReadonlyArray<IScript>): void;
    isSelected(script: IScript): boolean;
    selectAll(): void;
    deselectAll(): void;
}
