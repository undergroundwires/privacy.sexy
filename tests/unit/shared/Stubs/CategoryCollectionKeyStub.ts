import { CategoryCollectionKey } from '@/domain/Collection/CategoryCollectionKey';
import { OperatingSystem } from '@/domain/OperatingSystem';

export class CategoryCollectionKeyStub implements CategoryCollectionKey {
  public os: OperatingSystem = OperatingSystem.Android;

  public equals(otherKey: this): boolean {
    return this.os === otherKey.os;
  }

  public createSerializedKey(): string {
    return `${CategoryCollectionKeyStub.name}-${OperatingSystem[this.os]}`;
  }
}
