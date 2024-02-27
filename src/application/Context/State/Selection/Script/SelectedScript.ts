import type { IEntity } from '@/infrastructure/Entity/IEntity';
import type { IScript } from '@/domain/IScript';

type ScriptId = IScript['id'];

export interface SelectedScript extends IEntity<ScriptId> {
  readonly script: IScript;
  readonly revert: boolean;
}
