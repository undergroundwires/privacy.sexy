import type { ExecutableId } from '@/domain/Executables/Identifiable';

export type ScriptSelectionStatus = {
  readonly isSelected: true;
  readonly isReverted: boolean;
} | {
  readonly isSelected: false;
  readonly isReverted?: undefined;
};

export interface ScriptSelectionChange {
  readonly scriptId: ExecutableId;
  readonly newStatus: ScriptSelectionStatus;
}

export interface ScriptSelectionChangeCommand {
  readonly changes: ReadonlyArray<ScriptSelectionChange>;
}
