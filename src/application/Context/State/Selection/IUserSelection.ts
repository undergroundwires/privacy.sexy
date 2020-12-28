import { SelectedScript } from './SelectedScript';
import { ISignal } from '@/infrastructure/Events/Signal';
import { IScript } from '@/domain/IScript';
import { ICategory } from '@/domain/ICategory';

export interface IUserSelection {
    readonly changed: ISignal<ReadonlyArray<SelectedScript>>;
    readonly selectedScripts: ReadonlyArray<SelectedScript>;
    readonly totalSelected: number;
    areAllSelected(category: ICategory): boolean;
    isAnySelected(category: ICategory): boolean;
    removeAllInCategory(categoryId: number): void;
    addOrUpdateAllInCategory(categoryId: number, revert: boolean): void;
    addSelectedScript(scriptId: string, revert: boolean): void;
    addOrUpdateSelectedScript(scriptId: string, revert: boolean): void;
    removeSelectedScript(scriptId: string): void;
    selectOnly(scripts: ReadonlyArray<IScript>): void;
    isSelected(scriptId: string): boolean;
    selectAll(): void;
    deselectAll(): void;
}
