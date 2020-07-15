import { SelectedScript } from './SelectedScript';
import { ISignal } from '@/infrastructure/Events/Signal';
import { IScript } from '@/domain/IScript';

export interface IUserSelection {
    readonly changed: ISignal<ReadonlyArray<SelectedScript>>;
    readonly selectedScripts: ReadonlyArray<SelectedScript>;
    readonly totalSelected: number;
    addSelectedScript(scriptId: string, revert: boolean): void;
    addOrUpdateSelectedScript(scriptId: string, revert: boolean): void;
    removeSelectedScript(scriptId: string): void;
    selectOnly(scripts: ReadonlyArray<IScript>): void;
    isSelected(script: IScript): boolean;
    selectAll(): void;
    deselectAll(): void;
}
