import type { CategoryCollectionKey } from '@/domain/Collection/Key/CategoryCollectionKey';
import type { Key } from '@/domain/Executables/Identifiable/Key';

export interface ExecutableKey extends Key { // TODO: Include executable type
  readonly collectionKey: CategoryCollectionKey;
  readonly executableId: ExecutableId;
}

export type ExecutableId = string; // TODO: Is ExecutableId good name describing its executableId specific to a collection?
