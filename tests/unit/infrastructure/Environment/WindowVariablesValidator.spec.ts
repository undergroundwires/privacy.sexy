import { describe, it, expect } from 'vitest';
import { validateWindowVariables } from '@/infrastructure/Environment/WindowVariablesValidator';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { SystemOperationsStub } from '@tests/unit/shared/Stubs/SystemOperationsStub';
import { WindowVariables } from '@/infrastructure/Environment/WindowVariables';
import { itEachAbsentObjectValue } from '@tests/unit/shared/TestCases/AbsentTests';

describe('WindowVariablesValidator', () => {
  describe('validateWindowVariables', () => {
    describe('invalid types', () => {
      it('throws an error if variables is not an object', () => {
        // arrange
        const expectedError = 'window is not an object but string';
        const variablesAsString = 'not an object';
        // act
        const act = () => validateWindowVariables(variablesAsString as unknown);
        // assert
        expect(act).to.throw(expectedError);
      });

      it('throws an error if variables is an array', () => {
        // arrange
        const expectedError = 'window is not an object but object';
        const arrayVariables: unknown = [];
        // act
        const act = () => validateWindowVariables(arrayVariables as unknown);
        // assert
        expect(act).to.throw(expectedError);
      });

      describe('throws an error if variables is null', () => {
        itEachAbsentObjectValue((absentValue) => {
          // arrange
          const expectedError = 'missing variables';
          const variables = absentValue;
          // act
          const act = () => validateWindowVariables(variables as unknown);
          // assert
          expect(act).to.throw(expectedError);
        });
      });
    });

    describe('property validations', () => {
      it('throws an error with a description of all invalid properties', () => {
        // arrange
        const expectedError = 'Unexpected os (string)\nUnexpected isDesktop (string)';
        const input = {
          os: 'invalid',
          isDesktop: 'not a boolean',
        };
        // act
        const act = () => validateWindowVariables(input as unknown);
        // assert
        expect(act).to.throw(expectedError);
      });

      describe('`os` property', () => {
        it('throws an error when os is not a number', () => {
          // arrange
          const expectedError = 'Unexpected os (string)';
          const input = {
            os: 'Linux',
          };
          // act
          const act = () => validateWindowVariables(input as unknown);
          // assert
          expect(act).to.throw(expectedError);
        });

        it('throws an error for an invalid numeric os value', () => {
          // arrange
          const expectedError = 'Unexpected os (number)';
          const input = {
            os: Number.MAX_SAFE_INTEGER,
          };
          // act
          const act = () => validateWindowVariables(input as unknown);
          // assert
          expect(act).to.throw(expectedError);
        });

        it('does not throw for a missing os value', () => {
          const input = {
            isDesktop: true,
            system: new SystemOperationsStub(),
          };
          // act
          const act = () => validateWindowVariables(input);
          // assert
          expect(act).to.not.throw();
        });
      });

      describe('`isDesktop` property', () => {
        it('throws an error when only isDesktop is provided and it is true without a system object', () => {
          // arrange
          const expectedError = 'Unexpected system (undefined)';
          const input = {
            isDesktop: true,
          };
          // act
          const act = () => validateWindowVariables(input as unknown);
          // assert
          expect(act).to.throw(expectedError);
        });

        it('does not throw when isDesktop is true with a valid system object', () => {
          // arrange
          const input = {
            isDesktop: true,
            system: new SystemOperationsStub(),
          };
          // act
          const act = () => validateWindowVariables(input);
          // assert
          expect(act).to.not.throw();
        });

        it('does not throw when isDesktop is false without a system object', () => {
          // arrange
          const input = {
            isDesktop: false,
          };
          // act
          const act = () => validateWindowVariables(input);
          // assert
          expect(act).to.not.throw();
        });
      });

      describe('`system` property', () => {
        it('throws an error if system is not an object', () => {
          // arrange
          const expectedError = 'Unexpected system (string)';
          const input = {
            isDesktop: true,
            system: 'invalid system',
          };
          // act
          const act = () => validateWindowVariables(input as unknown);
          // assert
          expect(act).to.throw(expectedError);
        });
      });
    });

    it('does not throw for a valid object', () => {
      const input: WindowVariables = {
        os: OperatingSystem.Windows,
        isDesktop: true,
        system: new SystemOperationsStub(),
      };
      // act
      const act = () => validateWindowVariables(input);
      // assert
      expect(act).to.not.throw();
    });
  });
});
