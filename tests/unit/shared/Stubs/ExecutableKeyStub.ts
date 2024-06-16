import type { ExecutableId, ExecutableKey } from '@/domain/Executables/Identifiable/ExecutableKey/ExecutableKey';
import type { CategoryCollectionKey } from '@/domain/Collection/Key/CategoryCollectionKey';
import { CategoryCollectionKeyStub } from './CategoryCollectionKeyStub';

export function createKeyStubFromId(executableId: ExecutableId): ExecutableKey {
  return new ExecutableKeyStub().withExecutableId(executableId);
}

export class ExecutableKeyStub implements ExecutableKey {
  public collectionKey: CategoryCollectionKey = new CategoryCollectionKeyStub();

  public executableId: ExecutableId = `[${ExecutableKeyStub.name}]-executable-id`;

  public withExecutableId(executableId: string): this {
    this.executableId = executableId;
    return this;
  }

  public equals(key: ExecutableKey): boolean {
    return key.collectionKey === this.collectionKey
      && key.executableId === this.executableId;
  }

  public createSerializedKey(): string {
    return `collection: ${this.collectionKey.createSerializedKey()} | id: ${this.executableId}`;
  }
}
