import type { Category } from '@/domain/Executables/Category/Category';
import type { CategorySelectionChangeCommand } from './CategorySelectionChange';

export interface ReadonlyCategorySelection {
  areAllScriptsSelected(category: Category): boolean;
  isAnyScriptSelected(category: Category): boolean;
}

export interface CategorySelection extends ReadonlyCategorySelection {
  processChanges(action: CategorySelectionChangeCommand): void;
}
