import { CategoryCollectionKey } from '@/domain/Collection/CategoryCollectionKey';
import { ExecutableKey } from '@/domain/Executables/ExecutableKey/ExecutableKey';
import { CategoryCollectionKeyStub } from './CategoryCollectionKeyStub';

export class ExecutableKeyStub implements ExecutableKey {
  public collectionKey: CategoryCollectionKey = new CategoryCollectionKeyStub();

  public executableId: string = `[${ExecutableKeyStub.name}]-executable-id`;

  public withExecutableId(executableId: string): this {
    this.executableId = executableId;
    return this;
  }

  public equals(key: ExecutableKey): boolean {
    return key.collectionKey === this.collectionKey && key.executableId === this.executableId;
  }

  public createSerializedKey(): string {
    return `collection: ${this.collectionKey.createSerializedKey()} | id: ${this.executableId}`;
  }
}
