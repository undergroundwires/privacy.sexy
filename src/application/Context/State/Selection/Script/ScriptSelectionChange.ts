export type ScriptSelectionStatus = {
  readonly isSelected: true;
  readonly isReverted: boolean;
} | {
  readonly isSelected: false;
};

export interface ScriptSelectionChange {
  readonly scriptId: string;
  readonly newStatus: ScriptSelectionStatus;
}

export interface ScriptSelectionChangeCommand {
  readonly changes: ReadonlyArray<ScriptSelectionChange>;
}
