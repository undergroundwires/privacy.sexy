import type { IEventSource } from '@/infrastructure/Events/IEventSource';
import type { IScript } from '@/domain/IScript';
import type { SelectedScript } from './SelectedScript';
import type { ScriptSelectionChangeCommand } from './ScriptSelectionChange';

export interface ReadonlyScriptSelection {
  readonly changed: IEventSource<readonly SelectedScript[]>;
  readonly selectedScripts: readonly SelectedScript[];
  isSelected(scriptId: string): boolean;
}

export interface ScriptSelection extends ReadonlyScriptSelection {
  selectOnly(scripts: readonly IScript[]): void;
  selectAll(): void;
  deselectAll(): void;
  processChanges(action: ScriptSelectionChangeCommand): void;
}
