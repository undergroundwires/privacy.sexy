import { describe, it, expect } from 'vitest';
import { getWindowInjectedSystemOperations } from '@/infrastructure/SystemOperations/WindowInjectedSystemOperations';
import { WindowVariables } from '@/infrastructure/WindowVariables/WindowVariables';
import { itEachAbsentObjectValue } from '@tests/unit/shared/TestCases/AbsentTests';
import { SystemOperationsStub } from '@tests/unit/shared/Stubs/SystemOperationsStub';

describe('WindowInjectedSystemOperations', () => {
  describe('getWindowInjectedSystemOperations', () => {
    describe('throws if window is absent', () => {
      itEachAbsentObjectValue((absentValue) => {
        // arrange
        const expectedError = 'missing window';
        const window: WindowVariables = absentValue as never;
        // act
        const act = () => getWindowInjectedSystemOperations(window);
        // assert
        expect(act).to.throw(expectedError);
      }, { excludeUndefined: true });
    });
    describe('throw if system is absent', () => {
      itEachAbsentObjectValue((absentValue) => {
        // arrange
        const expectedError = 'missing system';
        const absentSystem = absentValue;
        const window: Partial<WindowVariables> = {
          system: absentSystem as never,
        };
        // act
        const act = () => getWindowInjectedSystemOperations(window);
        // assert
        expect(act).to.throw(expectedError);
      });
    });
    it('returns from window', () => {
      // arrange
      const expectedValue = new SystemOperationsStub();
      const window: Partial<WindowVariables> = {
        system: expectedValue,
      };
      // act
      const actualValue = getWindowInjectedSystemOperations(window);
      // assert
      expect(actualValue).to.equal(expectedValue);
    });
  });
});
