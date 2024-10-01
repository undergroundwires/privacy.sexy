import type { ExecutableId } from '@/domain/Executables/Identifiable';

type CategorySelectionStatus = {
  readonly isSelected: true;
  readonly isReverted: boolean;
} | {
  readonly isSelected: false;
};

export interface CategorySelectionChange {
  readonly categoryId: ExecutableId;
  readonly newStatus: CategorySelectionStatus;
}

export interface CategorySelectionChangeCommand {
  readonly changes: readonly CategorySelectionChange[];
}
