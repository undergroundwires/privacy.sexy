import {
  describe, it, expect,
} from 'vitest';
import { ApplicationFactory } from '@/application/ApplicationFactory';
import { getOperatingSystemDisplayName } from '@/presentation/components/Shared/OperatingSystemNames';
import { OperatingSystem } from '@/domain/OperatingSystem';

describe('OperatingSystemNames', () => {
  describe('getOperatingSystemDisplayName', () => {
    describe('retrieving display names for supported operating systems', async () => {
      // arrange
      const application = await ApplicationFactory.Current.getApp();
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
