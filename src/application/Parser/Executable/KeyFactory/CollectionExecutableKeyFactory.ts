import type { ExecutableId, ExecutableKey } from '@/domain/Executables/Identifiable/ExecutableKey/ExecutableKey';

export interface CollectionExecutableKeyFactory {
  createExecutableKey(executableId: ExecutableId): ExecutableKey;
}
