import type { ExecutableKey } from '@/domain/Executables/Identifiable/ExecutableKey/ExecutableKey';
import { PartialGuidExecutableKey } from '@/domain/Executables/Identifiable/ExecutableKey/PartialGuidExecutableKey';
import type { CategoryCollectionKey } from '@/domain/Collection/Key/CategoryCollectionKey';
import type { CollectionExecutableKeyFactory } from './CollectionExecutableKeyFactory';

// TODO: Unit tests missing

export class PartialGuidExecutableKeyFactory implements CollectionExecutableKeyFactory {
  constructor(private readonly collectionKey: CategoryCollectionKey) {

  }

  public createExecutableKey(executableId: string): ExecutableKey {
    return new PartialGuidExecutableKey(this.collectionKey, executableId);
  }
}
