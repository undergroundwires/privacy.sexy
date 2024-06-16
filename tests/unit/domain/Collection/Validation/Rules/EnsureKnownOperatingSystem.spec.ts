import { describe } from 'vitest';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { EnumRangeTestRunner } from '@tests/unit/application/Common/EnumRangeTestRunner';
import { ensureKnownOperatingSystem } from '@/domain/Collection/Validation/Rules/EnsureKnownOperatingSystem';
import { CategoryCollectionValidationContextStub } from '@tests/unit/shared/Stubs/CategoryCollectionValidationContextStub';

describe('ensureKnownOperatingSystem', () => {
  // act
  const act = (os: OperatingSystem) => test(os);
  // assert
  new EnumRangeTestRunner(act)
    .testValidValueDoesNotThrow(OperatingSystem.Android)
    .testOutOfRangeThrows();
});

function test(operatingSystem: OperatingSystem):
ReturnType<typeof ensureKnownOperatingSystem> {
  const context = new CategoryCollectionValidationContextStub()
    .withOperatingSystem(operatingSystem);
  return ensureKnownOperatingSystem(context);
}
