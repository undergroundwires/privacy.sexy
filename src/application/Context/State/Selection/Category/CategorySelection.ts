import type { ICategory } from '@/domain/ICategory';
import type { CategorySelectionChangeCommand } from './CategorySelectionChange';

export interface ReadonlyCategorySelection {
  areAllScriptsSelected(category: ICategory): boolean;
  isAnyScriptSelected(category: ICategory): boolean;
}

export interface CategorySelection extends ReadonlyCategorySelection {
  processChanges(action: CategorySelectionChangeCommand): void;
}
