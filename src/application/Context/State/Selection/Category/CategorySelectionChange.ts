import type { ExecutableKey } from '@/domain/Executables/Identifiable/ExecutableKey/ExecutableKey';

export type CategorySelectionStatus = {
  readonly isSelected: true;
  readonly isReverted: boolean;
} | {
  readonly isSelected: false;
};

export interface CategorySelectionChange {
  readonly categoryKey: ExecutableKey;
  readonly newStatus: CategorySelectionStatus;
}

export interface CategorySelectionChangeCommand {
  readonly changes: readonly CategorySelectionChange[];
}
