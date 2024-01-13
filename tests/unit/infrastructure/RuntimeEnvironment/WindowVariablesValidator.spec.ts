import { describe, it, expect } from 'vitest';
import { validateWindowVariables } from '@/infrastructure/WindowVariables/WindowVariablesValidator';
import { WindowVariables } from '@/infrastructure/WindowVariables/WindowVariables';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { getAbsentObjectTestCases, itEachAbsentObjectValue } from '@tests/unit/shared/TestCases/AbsentTests';
import { WindowVariablesStub } from '@tests/unit/shared/Stubs/WindowVariablesStub';
import { CodeRunnerStub } from '@tests/unit/shared/Stubs/CodeRunnerStub';
import { PropertyKeys } from '@/TypeHelpers';
import { LoggerStub } from '@tests/unit/shared/Stubs/LoggerStub';
import { DialogStub } from '@tests/unit/shared/Stubs/DialogStub';

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
        const invalidIsRunningAsDesktopApplication = 'not a boolean' as never;
        const expectedError = getExpectedError(
          {
            name: 'os',
            object: invalidOs,
          },
          {
            name: 'isRunningAsDesktopApplication',
            object: invalidIsRunningAsDesktopApplication,
          },
        );
        const input = new WindowVariablesStub()
          .withOs(invalidOs)
          .withIsRunningAsDesktopApplication(invalidIsRunningAsDesktopApplication);
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
            .withIsRunningAsDesktopApplication(true)
            .withOs(undefined);
          // act
          const act = () => validateWindowVariables(input);
          // assert
          expect(act).to.not.throw();
        });
      });

      describe('`isRunningAsDesktopApplication` property', () => {
        it('does not throw when true with valid services', () => {
          // arrange
          const windowVariables = new WindowVariablesStub();
          const windowVariableConfigurators: Record< // Ensure types match for compile-time checking
          PropertyKeys<Required<WindowVariables>>,
          (stub: WindowVariablesStub) => WindowVariablesStub> = {
            isRunningAsDesktopApplication: (s) => s.withIsRunningAsDesktopApplication(true),
            codeRunner: (s) => s.withCodeRunner(new CodeRunnerStub()),
            os: (s) => s.withOs(OperatingSystem.Windows),
            log: (s) => s.withLog(new LoggerStub()),
            dialog: (s) => s.withDialog(new DialogStub()),
          };
          Object
            .values(windowVariableConfigurators)
            .forEach((configure) => configure(windowVariables));
          // act
          const act = () => validateWindowVariables(windowVariables);
          // assert
          expect(act).to.not.throw();
        });

        describe('does not throw when false without services', () => {
          itEachAbsentObjectValue((absentValue) => {
            // arrange
            const absentCodeRunner = absentValue;
            const input = new WindowVariablesStub()
              .withIsRunningAsDesktopApplication(undefined)
              .withCodeRunner(absentCodeRunner);
            // act
            const act = () => validateWindowVariables(input);
            // assert
            expect(act).to.not.throw();
          }, { excludeNull: true });
        });
      });

      describe('`codeRunner` property', () => {
        expectObjectOnDesktop('codeRunner');
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
      const isOnDesktop = true;
      const invalidObject = invalidObjectValue as T;
      const expectedError = getExpectedError({
        name: key,
        object: invalidObject,
      });
      const input: WindowVariables = {
        ...new WindowVariablesStub(),
        isRunningAsDesktopApplication: isOnDesktop,
        [key]: invalidObject,
      };
      // act
      const act = () => validateWindowVariables(input);
      // assert
      expect(act).to.throw(expectedError);
    });
  });
  describe('does not validate object type when not on desktop', () => {
    itEachInvalidObjectValue((invalidObjectValue) => {
      // arrange
      const invalidObject = invalidObjectValue as T;
      const input: WindowVariables = {
        ...new WindowVariablesStub(),
        isRunningAsDesktopApplication: undefined,
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
