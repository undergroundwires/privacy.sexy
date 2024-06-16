import type { CategoryCollectionKey } from '@/domain/Collection/Key/CategoryCollectionKey';
import type { ExecutableKey } from './ExecutableKey';

// TODO: Unit tests

export class PartialGuidExecutableKey implements ExecutableKey {
  constructor(
    public readonly collectionKey: CategoryCollectionKey,
    public readonly executableId: string,
  ) {
    validatePartialGuidId(executableId);
  }

  public equals(key: ExecutableKey): boolean {
    return key.executableId === this.executableId
      && key.collectionKey.equals(this.collectionKey);
  }

  public createSerializedKey(): string {
    return `${this.collectionKey.createSerializedKey()}/${this.executableId}`;
  }
}

function validatePartialGuidId(id: string) {
  if (!id) {
    throw new Error('missing ID');
  }
  if (!/^[0-9a-fA-F]{8}$/.test(id)) {
    throw new Error(`ID ("${id}") is not a valid partial UUID`);
  }
}
