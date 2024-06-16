import { OperatingSystem } from '@/domain/OperatingSystem';
import { assertInRange } from '@/application/Common/Enum';
import type { CategoryCollectionKey } from './CategoryCollectionKey';

// TODO: Missing unit tests

export class OsCategoryCollectionKey implements CategoryCollectionKey { // TODO: Good name? Does not read well.
  constructor(public readonly os: OperatingSystem) {
    validateOperatingSystem(os);
  }

  public equals(otherKey: OsCategoryCollectionKey): boolean {
    return this.os === otherKey.os;
  }

  public createSerializedKey(): string {
    return OperatingSystem[this.os];
  }
}

function validateOperatingSystem(os: OperatingSystem) {
  assertInRange(os, OperatingSystem);
}
