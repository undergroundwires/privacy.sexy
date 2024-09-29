import {
  describe, it, expect,
} from 'vitest';
import { getOperatingSystemDisplayName } from '@/presentation/components/Shared/OperatingSystemNames';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { createOrGetApplication } from '@/application/Loader/LazySingletonApplicationProvider';

describe('OperatingSystemNames', () => {
  describe('getOperatingSystemDisplayName', () => {
    describe('retrieving display names for supported operating systems', async () => {
      // arrange
      const application = await createOrGetApplication();
      const supportedOperatingSystems = application.getSupportedOsList();
      supportedOperatingSystems.forEach((supportedOperatingSystem) => {
        it(`should return a non-empty name for ${OperatingSystem[supportedOperatingSystem]}`, () => {
          // act
          const displayName = getOperatingSystemDisplayName(supportedOperatingSystem);
          // assert
          expect(displayName).to.have.length.greaterThanOrEqual(1);
        });
      });
    });
  });
});
