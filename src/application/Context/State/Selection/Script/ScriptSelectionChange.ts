import type { ExecutableKey } from '@/domain/Executables/Identifiable/ExecutableKey/ExecutableKey';

export type ScriptSelectionStatus = {
  readonly isSelected: true;
  readonly isReverted: boolean;
} | {
  readonly isSelected: false;
  readonly isReverted?: undefined;
};

export interface ScriptSelectionChange {
  readonly scriptKey: ExecutableKey;
  readonly newStatus: ScriptSelectionStatus;
}

export interface ScriptSelectionChangeCommand {
  readonly changes: ReadonlyArray<ScriptSelectionChange>;
}
