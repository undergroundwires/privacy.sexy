import type { IEntity } from '@/infrastructure/Entity/IEntity';
import type { Script } from '@/domain/Executables/Script/Script';

type ScriptId = Script['id'];

export interface SelectedScript extends IEntity<ScriptId> {
  readonly script: Script;
  readonly revert: boolean;
}
