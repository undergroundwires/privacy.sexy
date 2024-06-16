<<<<<<< HEAD
import type { Script } from '@/domain/Executables/Script/Script';
import type { RepositoryEntity } from '@/application/Repository/RepositoryEntity';

export interface SelectedScript extends RepositoryEntity {
=======
import type { Identifiable } from '@/domain/Identifiable/Identifiable';
import type { Script } from '@/domain/Executables/Script/Script';
import type { ExecutableKey } from '@/domain/Executables/ExecutableKey/ExecutableKey';

export interface SelectedScript extends Identifiable<ExecutableKey> {
>>>>>>> cbea6fa3 (Add unique script/category IDs $49, $59, $262, $126)
  readonly script: Script;
  readonly revert: boolean;
}
