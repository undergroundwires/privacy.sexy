import type { Key } from '../../Identifiable/Key';
import { OperatingSystem } from '../../OperatingSystem';

export interface CategoryCollectionKey extends Key {
  readonly os: OperatingSystem;
}
