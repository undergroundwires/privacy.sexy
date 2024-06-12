import { BaseEntity } from '@/infrastructure/Entity/BaseEntity';
import type { Script } from '@/domain/Executables/Script/Script';
import type { SelectedScript } from './SelectedScript';

type SelectedScriptId = SelectedScript['id'];

export class UserSelectedScript extends BaseEntity<SelectedScriptId> {
  constructor(
    public readonly script: Script,
    public readonly revert: boolean,
  ) {
    super(script.id);
    if (revert && !script.canRevert()) {
      throw new Error(`The script with ID '${script.id}' is not reversible and cannot be reverted.`);
    }
  }
}
