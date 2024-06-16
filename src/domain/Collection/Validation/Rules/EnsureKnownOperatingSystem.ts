import { assertInRange } from '@/application/Common/Enum';
import { OperatingSystem } from '@/domain/OperatingSystem';
import type { CategoryCollectionValidator } from '../CategoryCollectionValidator';

export const ensureKnownOperatingSystem: CategoryCollectionValidator = (
  context,
) => {
  assertInRange(context.operatingSystem, OperatingSystem);
};
