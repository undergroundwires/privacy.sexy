import { describe, it, expect } from 'vitest';
import { validateWindowVariables } from '@/infrastructure/WindowVariables/WindowVariablesValidator';
import { WindowVariables } from '@/infrastructure/WindowVariables/WindowVariables';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { getAbsentObjectTestCases } from '@tests/unit/shared/TestCases/AbsentTests';
import { WindowVariablesStub } from '@tests/unit/shared/Stubs/WindowVariablesStub';
import { CodeRunnerStub } from '@tests/unit/shared/Stubs/CodeRunnerStub';
import { PropertyKeys } from '@/TypeHelpers';
import { LoggerStub } from '@tests/unit/shared/Stubs/LoggerStub';
import { DialogStub } from '@tests/unit/shared/Stubs/DialogStub';
import { ScriptDiagnosticsCollectorStub } from '@tests/unit/shared/Stubs/ScriptDiagnosticsCollectorStub';
import { ElectronEnvironmentDetector } from '@/infrastructure/RuntimeEnvironment/Electron/ElectronEnvironmentDetector';
import { ElectronEnvironmentDetectorStub } from '@tests/unit/shared/Stubs/ElectronEnvironmentDetectorStub';

describe('WindowVariablesValidator', () => {
  describe('validateWindowVariables', () => {
    it('throws an error with a description of all invalid properties', () => {
      // arrange
      const invalidOs = 'invalid' as unknown as OperatingSystem;
      const invalidIsRunningAsDesktopApplication = 'not a boolean' as never;
      const expectedError = getExpectedError(
        {
          name: 'os',
          value: invalidOs,
        },
        {
          name: 'isRunningAsDesktopApplication',
          value: invalidIsRunningAsDesktopApplication,
        },
      );
      const input = new WindowVariablesStub()
        .withOs(invalidOs)
        .withIsRunningAsDesktopApplication(invalidIsRunningAsDesktopApplication);
      const context = new ValidateWindowVariablesTestSetup()
        .withWindowVariables(input);
      // act
      const act = () => context.validateWindowVariables();
      // assert
      expect(act).to.throw(expectedError);
    });
    describe('when not in Electron renderer process', () => {
      const testScenarios: ReadonlyArray<{
        readonly description: string;
        readonly environment: ElectronEnvironmentDetector;
      }> = [
        {
          description: 'skips in non-Electron environments',
          environment: new ElectronEnvironmentDetectorStub()
            .withNonElectronEnvironment(),
        },
        {
          description: 'skips in Electron main process',
          environment: new ElectronEnvironmentDetectorStub()
            .withElectronEnvironment('main'),
        },
        {
          description: 'skips in Electron preloader process',
          environment: new ElectronEnvironmentDetectorStub()
            .withElectronEnvironment('preloader'),
        },
      ];
      testScenarios.forEach(({ description, environment }) => {
        it(description, () => {
          // arrange
          const invalidOs = 'invalid' as unknown as OperatingSystem;
          const input = new WindowVariablesStub()
            .withOs(invalidOs);
          const context = new ValidateWindowVariablesTestSetup()
            .withElectronDetector(environment)
            .withWindowVariables(input);
          // act
          const act = () => context.validateWindowVariables();
          // assert
          expect(act).to.not.throw();
        });
      });
    });

    describe('does not throw when a property is valid', () => {
      const testScenarios: Record<PropertyKeys<Required<WindowVariables>>, ReadonlyArray<{
        readonly description: string;
        readonly validValue: unknown;
      }>> = {
        isRunningAsDesktopApplication: [{
          description: 'accepts boolean true',
          validValue: true,
        }],
        os: [
          {
            description: 'accepts undefined',
            validValue: undefined,
          },
          {
            description: 'accepts valid enum value',
            validValue: OperatingSystem.WindowsPhone,
          },
        ],
        codeRunner: [{
          description: 'accepts an object',
          validValue: new CodeRunnerStub(),
        }],
        log: [{
          description: 'accepts an object',
          validValue: new LoggerStub(),
        }],
        dialog: [{
          description: 'accepts an object',
          validValue: new DialogStub(),
        }],
        scriptDiagnosticsCollector: [{
          description: 'accepts an object',
          validValue: new ScriptDiagnosticsCollectorStub(),
        }],
      };
      Object.entries(testScenarios).forEach(([propertyKey, validValueScenarios]) => {
        describe(propertyKey, () => {
          validValueScenarios.forEach(({ description, validValue }) => {
            it(description, () => {
              // arrange
              const input = new WindowVariablesStub();
              input[propertyKey] = validValue;
              const context = new ValidateWindowVariablesTestSetup()
                .withWindowVariables(input);
              // act
              const act = () => context.validateWindowVariables();
              // assert
              expect(act).to.not.throw();
            });
          });
        });
      });
    });

    describe('throws an error when a property is invalid', () => {
      interface InvalidValueTestCase {
        readonly description: string;
        readonly invalidValue: unknown;
      }
      const testScenarios: Record<
      PropertyKeys<Required<WindowVariables>>,
      ReadonlyArray<InvalidValueTestCase>> = {
        isRunningAsDesktopApplication: [
          {
            description: 'rejects false',
            invalidValue: false,
          },
          {
            description: 'rejects undefined',
            invalidValue: undefined,
          },
        ],
        os: [
          {
            description: 'rejects non-numeric',
            invalidValue: 'Linux',
          },
          {
            description: 'rejects out-of-range',
            invalidValue: Number.MAX_SAFE_INTEGER,
          },
        ],
        codeRunner: getInvalidObjectValueTestCases(),
        log: getInvalidObjectValueTestCases(),
        dialog: getInvalidObjectValueTestCases(),
        scriptDiagnosticsCollector: getInvalidObjectValueTestCases(),
      };
      Object.entries(testScenarios).forEach(([propertyKey, validValueScenarios]) => {
        describe(propertyKey, () => {
          validValueScenarios.forEach(({ description, invalidValue }) => {
            it(description, () => {
              // arrange
              const expectedErrorMessage = getExpectedError({
                name: propertyKey as keyof WindowVariables,
                value: invalidValue,
              });
              const input = new WindowVariablesStub();
              input[propertyKey] = invalidValue;
              const context = new ValidateWindowVariablesTestSetup()
                .withWindowVariables(input);
              // act
              const act = () => context.validateWindowVariables();
              // assert
              expect(act).to.throw(expectedErrorMessage);
            });
          });
        });
      });
      function getInvalidObjectValueTestCases(): InvalidValueTestCase[] {
        return [
          {
            description: 'rejects string',
            invalidValue: 'invalid object',
          },
          {
            description: 'rejects array of objects',
            invalidValue: [{}, {}],
          },
          ...getAbsentObjectTestCases().map((testCase) => ({
            description: `rejects absent: ${testCase.valueName}`,
            invalidValue: testCase.absentValue,
          })),
        ];
      }
    });
  });
});

class ValidateWindowVariablesTestSetup {
  private electronDetector: ElectronEnvironmentDetector = new ElectronEnvironmentDetectorStub()
    .withElectronEnvironment('renderer');

  private windowVariables: WindowVariables = new WindowVariablesStub();

  public withWindowVariables(windowVariables: WindowVariables): this {
    this.windowVariables = windowVariables;
    return this;
  }

  public withElectronDetector(electronDetector: ElectronEnvironmentDetector): this {
    this.electronDetector = electronDetector;
    return this;
  }

  public validateWindowVariables() {
    return validateWindowVariables(
      this.windowVariables,
      this.electronDetector,
    );
  }
}

function getExpectedError(...unexpectedObjects: Array<{
  readonly name: keyof WindowVariables;
  readonly value: unknown;
}>) {
  const errors = unexpectedObjects
    .map(({ name, value: object }) => `Unexpected ${name} (${typeof object})`);
  return errors.join('\n');
}
