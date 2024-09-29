import type { Script } from '@/domain/Executables/Script/Script';
import type { RepositoryEntity } from '@/application/Repository/RepositoryEntity';

export class UserSelectedScript implements RepositoryEntity {
  public readonly id: string;

  constructor(
    public readonly script: Script,
    public readonly revert: boolean,
  ) {
    this.id = script.executableId;
    if (revert && !script.canRevert()) {
      throw new Error(`The script with ID '${script.executableId}' is not reversible and cannot be reverted.`);
    }
  }
}
