import { BaseEntity } from '@/infrastructure/Entity/BaseEntity';
import type { IScript } from '@/domain/IScript';
import type { SelectedScript } from './SelectedScript';

type SelectedScriptId = SelectedScript['id'];

export class UserSelectedScript extends BaseEntity<SelectedScriptId> {
  constructor(
    public readonly script: IScript,
    public readonly revert: boolean,
  ) {
    super(script.id);
    if (revert && !script.canRevert()) {
      throw new Error(`The script with ID '${script.id}' is not reversible and cannot be reverted.`);
    }
  }
}
