import { describe, it, expect } from 'vitest';
import { CurrentEnvironment } from '@/infrastructure/RuntimeEnvironment/RuntimeEnvironmentFactory';

describe('RuntimeEnvironmentFactory', () => {
  describe('CurrentEnvironment', () => {
    it('identifies as browser in test environment', () => { // Ensures test independence from Electron IPC
      // arrange
      const expectedDesktopAppState = false;
      // act
      const isRunningAsDesktop = CurrentEnvironment.isRunningAsDesktopApplication;
      // assert
      expect(isRunningAsDesktop).to.equal(expectedDesktopAppState);
    });
    it('identifies as non-production in test environment', () => {
      // arrange
      const expectedNonProductionState = true;
      // act
      const isNonProductionEnvironment = CurrentEnvironment.isNonProduction;
      // assert
      expect(isNonProductionEnvironment).to.equal(expectedNonProductionState);
    });
  });
});
