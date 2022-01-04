import type { ExecutableId, ExecutableKey } from '@/domain/Executables/ExecutableKey/ExecutableKey';

export interface CollectionExecutableKeyFactory {
  createExecutableKey(executableId: ExecutableId): ExecutableKey;
}
