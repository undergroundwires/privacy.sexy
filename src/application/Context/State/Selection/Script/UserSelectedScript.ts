import type { ExecutableKey } from '@/domain/Executables/ExecutableKey/ExecutableKey';
import type { Script } from '@/domain/Executables/Script/Script';
import type { Identifiable } from '@/domain/Identifiable/Identifiable';

export class UserSelectedScript implements Identifiable<ExecutableKey> {
  public readonly key: ExecutableKey;

  constructor(
    public readonly script: Script,
    public readonly revert: boolean,
  ) {
    this.key = script.key;
    if (revert && !script.canRevert()) {
      throw new Error(`The script with ID '${script.key}' is not reversible and cannot be reverted.`);
    }
  }
}
