import type { Identifiable } from '@/domain/Identifiable/Identifiable';
import type { Script } from '@/domain/Executables/Script/Script';
import type { ExecutableKey } from '@/domain/Executables/ExecutableKey/ExecutableKey';

export interface SelectedScript extends Identifiable<ExecutableKey> {
  readonly script: Script;
  readonly revert: boolean;
}
