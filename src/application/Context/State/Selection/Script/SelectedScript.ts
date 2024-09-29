import type { Script } from '@/domain/Executables/Script/Script';
import type { RepositoryEntity } from '@/application/Repository/RepositoryEntity';

export interface SelectedScript extends RepositoryEntity {
  readonly script: Script;
  readonly revert: boolean;
}
