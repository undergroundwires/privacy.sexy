import { IScript } from '@/domain/IScript';
import { ICategory } from '@/domain/ICategory';
import { IEventSource } from '@/infrastructure/Events/IEventSource';
import { SelectedScript } from './SelectedScript';

export interface IReadOnlyUserSelection {
  readonly changed: IEventSource<ReadonlyArray<SelectedScript>>;
  readonly selectedScripts: ReadonlyArray<SelectedScript>;
  isSelected(scriptId: string): boolean;
  areAllSelected(category: ICategory): boolean;
  isAnySelected(category: ICategory): boolean;
}

export interface IUserSelection extends IReadOnlyUserSelection {
  removeAllInCategory(categoryId: number): void;
  addOrUpdateAllInCategory(categoryId: number, revert: boolean): void;
  addSelectedScript(scriptId: string, revert: boolean): void;
  addOrUpdateSelectedScript(scriptId: string, revert: boolean): void;
  removeSelectedScript(scriptId: string): void;
  selectOnly(scripts: ReadonlyArray<IScript>): void;
  selectAll(): void;
  deselectAll(): void;
}
