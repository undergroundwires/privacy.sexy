import { SelectedScript } from './SelectedScript';
import { IScript } from '@/domain/IScript';
import { ICategory } from '@/domain/ICategory';
import { IEventSource } from '@/infrastructure/Events/IEventSource';

export interface IUserSelection {
    readonly changed: IEventSource<ReadonlyArray<SelectedScript>>;
    readonly selectedScripts: ReadonlyArray<SelectedScript>;
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
