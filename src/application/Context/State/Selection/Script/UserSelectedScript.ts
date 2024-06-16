<<<<<<< HEAD
import type { Script } from '@/domain/Executables/Script/Script';
import type { RepositoryEntity } from '@/application/Repository/RepositoryEntity';

export class UserSelectedScript implements RepositoryEntity {
  public readonly id: string;
=======
import type { ExecutableKey } from '@/domain/Executables/ExecutableKey/ExecutableKey';
import type { Script } from '@/domain/Executables/Script/Script';
import type { Identifiable } from '@/domain/Identifiable/Identifiable';

export class UserSelectedScript implements Identifiable<ExecutableKey> {
  public readonly key: ExecutableKey;
>>>>>>> cbea6fa3 (Add unique script/category IDs $49, $59, $262, $126)

  constructor(
    public readonly script: Script,
    public readonly revert: boolean,
  ) {
<<<<<<< HEAD
    this.id = script.executableId;
    if (revert && !script.canRevert()) {
      throw new Error(`The script with ID '${script.executableId}' is not reversible and cannot be reverted.`);
=======
    this.key = script.key;
    if (revert && !script.canRevert()) {
      throw new Error(`The script with ID '${script.key}' is not reversible and cannot be reverted.`);
>>>>>>> cbea6fa3 (Add unique script/category IDs $49, $59, $262, $126)
    }
  }
}
