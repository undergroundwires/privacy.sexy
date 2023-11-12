import { describe, it, expect } from 'vitest';
import { validateWindowVariables } from '@/infrastructure/WindowVariables/WindowVariablesValidator';
import { WindowVariables } from '@/infrastructure/WindowVariables/WindowVariables';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { SystemOperationsStub } from '@tests/unit/shared/Stubs/SystemOperationsStub';
import { getAbsentObjectTestCases } from '@tests/unit/shared/TestCases/AbsentTests';
import { WindowVariablesStub } from '@tests/unit/shared/Stubs/WindowVariablesStub';

describe('WindowVariablesValidator', () => {
  describe('validateWindowVariables', () => {
    describe('validates window type', () => {
      itEachInvalidObjectValue((invalidObjectValue) => {
        // arrange
        const expectedError = 'window is not an object';
        const window: Partial<WindowVariables> = invalidObjectValue as never;
        // act
        const act = () => validateWindowVariables(window);
        // assert
        expect(act).to.throw(expectedError);
      });
    });

    describe('property validations', () => {
      it('throws an error with a description of all invalid properties', () => {
        // arrange
        const invalidOs = 'invalid' as unknown as OperatingSystem;
        const invalidIsDesktop = 'not a boolean' as unknown as boolean;
        const expectedError = getExpectedError(
          {
            name: 'os',
            object: invalidOs,
          },
          {
            name: 'isDesktop',
            object: invalidIsDesktop,
          },
        );
        const input = new WindowVariablesStub()
          .withOs(invalidOs)
          .withIsDesktop(invalidIsDesktop);
        // act
        const act = () => validateWindowVariables(input);
        // assert
        expect(act).to.throw(expectedError);
      });

      describe('`os` property', () => {
        it('throws an error when os is not a number', () => {
          // arrange
          const invalidOs = 'Linux' as unknown as OperatingSystem;
          const expectedError = getExpectedError(
            {
              name: 'os',
              object: invalidOs,
            },
          );
          const input = new WindowVariablesStub()
            .withOs(invalidOs);
          // act
          const act = () => validateWindowVariables(input);
          // assert
          expect(act).to.throw(expectedError);
        });

        it('throws an error for an invalid numeric os value', () => {
          // arrange
          const invalidOs = Number.MAX_SAFE_INTEGER;
          const expectedError = getExpectedError(
            {
              name: 'os',
              object: invalidOs,
            },
          );
          const input = new WindowVariablesStub()
            .withOs(invalidOs);
          // act
          const act = () => validateWindowVariables(input);
          // assert
          expect(act).to.throw(expectedError);
        });

        it('does not throw for a missing os value', () => {
          // arrange
          const input = new WindowVariablesStub()
            .withIsDesktop(true)
            .withOs(undefined);
          // act
          const act = () => validateWindowVariables(input);
          // assert
          expect(act).to.not.throw();
        });
      });

      describe('`isDesktop` property', () => {
        it('throws an error when only isDesktop is provided and it is true without a system object', () => {
          // arrange
          const systemObject = undefined;
          const expectedError = getExpectedError(
            {
              name: 'system',
              object: systemObject,
            },
          );
          const input = new WindowVariablesStub()
            .withIsDesktop(true)
            .withSystem(systemObject);
          // act
          const act = () => validateWindowVariables(input);
          // assert
          expect(act).to.throw(expectedError);
        });

        it('does not throw when isDesktop is true with a valid system object', () => {
          // arrange
          const validSystem = new SystemOperationsStub();
          const input = new WindowVariablesStub()
            .withIsDesktop(true)
            .withSystem(validSystem);
          // act
          const act = () => validateWindowVariables(input);
          // assert
          expect(act).to.not.throw();
        });

        it('does not throw when isDesktop is false without a system object', () => {
          // arrange
          const absentSystem = undefined;
          const input = new WindowVariablesStub()
            .withIsDesktop(false)
            .withSystem(absentSystem);
          // act
          const act = () => validateWindowVariables(input);
          // assert
          expect(act).to.not.throw();
        });
      });

      describe('`system` property', () => {
        expectObjectOnDesktop('system');
      });

      describe('`log` property', () => {
        expectObjectOnDesktop('log');
      });
    });

    it('does not throw for a valid object', () => {
      const input = new WindowVariablesStub();
      // act
      const act = () => validateWindowVariables(input);
      // assert
      expect(act).to.not.throw();
    });
  });
});

function expectObjectOnDesktop<T>(key: keyof WindowVariables) {
  describe('validates object type on desktop', () => {
    itEachInvalidObjectValue((invalidObjectValue) => {
      // arrange
      const invalidObject = invalidObjectValue as T;
      const expectedError = getExpectedError({
        name: key,
        object: invalidObject,
      });
      const input: WindowVariables = {
        ...new WindowVariablesStub(),
        isDesktop: true,
        [key]: invalidObject,
      };
      // act
      const act = () => validateWindowVariables(input);
      // assert
      expect(act).to.throw(expectedError);
    });
  });
  describe('does not object type when not on desktop', () => {
    itEachInvalidObjectValue((invalidObjectValue) => {
      // arrange
      const invalidObject = invalidObjectValue as T;
      const input: WindowVariables = {
        ...new WindowVariablesStub(),
        isDesktop: undefined,
        [key]: invalidObject,
      };
      // act
      const act = () => validateWindowVariables(input);
      // assert
      expect(act).to.not.throw();
    });
  });
}

function itEachInvalidObjectValue<T>(runner: (invalidObjectValue: T) => void) {
  const testCases: Array<{
    readonly name: string;
    readonly value: T;
  }> = [
    {
      name: 'given string',
      value: 'invalid object' as unknown as T,
    },
    {
      name: 'given array of objects',
      value: [{}, {}] as unknown as T,
    },
    ...getAbsentObjectTestCases().map((testCase) => ({
      name: `given absent: ${testCase.valueName}`,
      value: testCase.absentValue as unknown as T,
    })),
  ];
  testCases.forEach((testCase) => {
    it(testCase.name, () => {
      runner(testCase.value);
    });
  });
}

function getExpectedError(...unexpectedObjects: Array<{
  readonly name: keyof WindowVariables;
  readonly object: unknown;
}>) {
  const errors = unexpectedObjects
    .map(({ name, object }) => `Unexpected ${name} (${typeof object})`);
  return errors.join('\n');
}
