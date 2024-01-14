import { describe, it, expect } from 'vitest';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { AllSupportedOperatingSystems, SupportedOperatingSystem } from '@tests/shared/TestCases/SupportedOperatingSystems';
import { VisibleTerminalScriptExecutor } from '@/infrastructure/CodeRunner/Execution/VisibleTerminalScriptFileExecutor';
import { RuntimeEnvironmentStub } from '@tests/unit/shared/Stubs/RuntimeEnvironmentStub';
import { LoggerStub } from '@tests/unit/shared/Stubs/LoggerStub';
import { SystemOperationsStub } from '@tests/unit/shared/Stubs/SystemOperationsStub';
import { CommandOpsStub } from '@tests/unit/shared/Stubs/CommandOpsStub';
import { SystemOperations } from '@/infrastructure/CodeRunner/System/SystemOperations';
import { FileSystemOpsStub } from '@tests/unit/shared/Stubs/FileSystemOpsStub';
import { CodeRunErrorType } from '@/application/CodeRunner/CodeRunner';
import { Logger } from '@/application/Common/Log/Logger';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';

describe('VisibleTerminalScriptFileExecutor', () => {
  describe('executeScriptFile', () => {
    describe('command execution', () => {
      // arrange
      const testScenarios: Record<SupportedOperatingSystem, readonly {
        readonly filePath: string;
        readonly expectedCommand: string;
        readonly description: string;
      }[]> = {
        [OperatingSystem.Windows]: [
          {
            description: 'encloses path in quotes',
            filePath: 'file',
            expectedCommand: 'PowerShell Start-Process -Verb RunAs -FilePath "file"',
          },
        ],
        [OperatingSystem.macOS]: [
          {
            description: 'encloses path in quotes',
            filePath: 'file',
            expectedCommand: 'open -a Terminal.app \'file\'',
          },
          {
            description: 'escapes single quotes in path',
            filePath: 'f\'i\'le',
            expectedCommand: 'open -a Terminal.app \'f\'\\\'\'i\'\\\'\'le\'',
          },
        ],
        [OperatingSystem.Linux]: [
          {
            description: 'encloses path in quotes',
            filePath: 'file',
            expectedCommand: 'x-terminal-emulator -e \'file\'',
          },
          {
            description: 'escapes single quotes in path',
            filePath: 'f\'i\'le',
            expectedCommand: 'x-terminal-emulator -e \'f\'\\\'\'i\'\\\'\'le\'',
          },
        ],
      };
      AllSupportedOperatingSystems.forEach((operatingSystem) => {
        describe(`on ${OperatingSystem[operatingSystem]}`, () => {
          testScenarios[operatingSystem].forEach((
            { description, filePath, expectedCommand },
          ) => {
            it(`executes command - ${description}`, async () => {
              // arrange
              const command = new CommandOpsStub();
              const context = new ScriptFileExecutorTestSetup()
                .withOs(operatingSystem)
                .withFilePath(filePath)
                .withSystemOperations(new SystemOperationsStub().withCommand(command));

              // act
              await context.executeScriptFile();

              // assert
              const calls = command.callHistory.filter((c) => c.methodName === 'exec');
              expect(calls.length).to.equal(1);
              const [actualCommand] = calls[0].args;
              expect(actualCommand).to.equal(expectedCommand);
            });
          });
        });
      });
    });
    describe('file permissions', () => {
      it('sets permissions before execution', async () => {
        // arrange
        let isExecutedAfterPermissions = false;
        let isPermissionsSet = false;
        const fileSystemMock = new FileSystemOpsStub();
        fileSystemMock.setFilePermissions = () => {
          isPermissionsSet = true;
          return Promise.resolve();
        };
        const commandMock = new CommandOpsStub();
        commandMock.exec = () => {
          isExecutedAfterPermissions = isPermissionsSet;
          return Promise.resolve();
        };
        const context = new ScriptFileExecutorTestSetup()
          .withSystemOperations(new SystemOperationsStub()
            .withFileSystem(fileSystemMock)
            .withCommand(commandMock));

        // act
        await context.executeScriptFile();

        // assert
        expect(isExecutedAfterPermissions).to.equal(true);
      });
      it('applies correct permissions', async () => {
        // arrange
        const expectedMode = '755';
        const fileSystem = new FileSystemOpsStub();
        const context = new ScriptFileExecutorTestSetup()
          .withSystemOperations(new SystemOperationsStub().withFileSystem(fileSystem));

        // act
        await context.executeScriptFile();

        // assert
        const calls = fileSystem.callHistory.filter((call) => call.methodName === 'setFilePermissions');
        expect(calls.length).to.equal(1);
        const [, actualMode] = calls[0].args;
        expect(actualMode).to.equal(expectedMode);
      });
      it('sets permissions for correct file', async () => {
        // arrange
        const expectedFilePath = 'expected-file-path';
        const fileSystem = new FileSystemOpsStub();
        const context = new ScriptFileExecutorTestSetup()
          .withFilePath(expectedFilePath)
          .withSystemOperations(new SystemOperationsStub().withFileSystem(fileSystem));

        // act
        await context.executeScriptFile();

        // assert
        const calls = fileSystem.callHistory.filter((call) => call.methodName === 'setFilePermissions');
        expect(calls.length).to.equal(1);
        const [actualFilePath] = calls[0].args;
        expect(actualFilePath).to.equal(expectedFilePath);
      });
    });
    it('indicates success on successful execution', async () => {
      // arrange
      const expectedSuccessResult = true;
      const context = new ScriptFileExecutorTestSetup();

      // act
      const { success: actualSuccessValue } = await context.executeScriptFile();

      // assert
      expect(actualSuccessValue).to.equal(expectedSuccessResult);
    });
    describe('error handling', () => {
      const testScenarios: ReadonlyArray<{
        readonly description: string;
        readonly expectedErrorType: CodeRunErrorType;
        readonly expectedErrorMessage: string;
        buildFaultyContext(
          setup: ScriptFileExecutorTestSetup,
          errorMessage: string,
        ): ScriptFileExecutorTestSetup;
      }> = [
        {
          description: 'unindentified os',
          expectedErrorType: 'UnsupportedOperatingSystem',
          expectedErrorMessage: 'Operating system could not be identified from environment',
          buildFaultyContext: (setup) => {
            return setup.withOs(undefined);
          },
        },
        {
          description: 'unsupported OS',
          expectedErrorType: 'UnsupportedOperatingSystem',
          expectedErrorMessage: `Unsupported operating system: ${OperatingSystem[OperatingSystem.Android]}`,
          buildFaultyContext: (setup) => {
            return setup.withOs(OperatingSystem.Android);
          },
        },
        {
          description: 'file permissions failure',
          expectedErrorType: 'FileExecutionError',
          expectedErrorMessage: 'Error when setting file permissions',
          buildFaultyContext: (setup, errorMessage) => {
            const fileSystem = new FileSystemOpsStub();
            fileSystem.setFilePermissions = () => Promise.reject(errorMessage);
            return setup.withSystemOperations(
              new SystemOperationsStub().withFileSystem(fileSystem),
            );
          },
        },
        {
          description: 'command failure',
          expectedErrorType: 'FileExecutionError',
          expectedErrorMessage: 'Error when setting file permissions',
          buildFaultyContext: (setup, errorMessage) => {
            const command = new CommandOpsStub();
            command.exec = () => Promise.reject(errorMessage);
            return setup.withSystemOperations(
              new SystemOperationsStub().withCommand(command),
            );
          },
        },
      ];
      testScenarios.forEach(({
        description, expectedErrorType, expectedErrorMessage, buildFaultyContext,
      }) => {
        it(`handles error - ${description}`, async () => {
          // arrange
          const context = buildFaultyContext(
            new ScriptFileExecutorTestSetup(),
            expectedErrorMessage,
          );

          // act
          const { success, error } = await context.executeScriptFile();

          // assert
          expect(success).to.equal(false);
          expectExists(error);
          expect(error.message).to.include(expectedErrorMessage);
          expect(error.type).to.equal(expectedErrorType);
        });
        it(`logs error - ${description}`, async () => {
          // arrange
          const loggerStub = new LoggerStub();
          const context = buildFaultyContext(
            new ScriptFileExecutorTestSetup()
              .withLogger(loggerStub),
            expectedErrorMessage,
          );

          // act
          await context.executeScriptFile();

          // assert
          loggerStub.assertLogsContainMessagePart('error', expectedErrorMessage);
        });
      });
    });
  });
});

class ScriptFileExecutorTestSetup {
  private os?: OperatingSystem = OperatingSystem.Windows;

  private filePath = `[${ScriptFileExecutorTestSetup.name}] file path`;

  private system: SystemOperations = new SystemOperationsStub();

  private logger: Logger = new LoggerStub();

  public withLogger(logger: Logger): this {
    this.logger = logger;
    return this;
  }

  public withOs(os: OperatingSystem | undefined): this {
    this.os = os;
    return this;
  }

  public withSystemOperations(system: SystemOperations): this {
    this.system = system;
    return this;
  }

  public withFilePath(filePath: string): this {
    this.filePath = filePath;
    return this;
  }

  public executeScriptFile() {
    const environment = new RuntimeEnvironmentStub().withOs(this.os);
    const executor = new VisibleTerminalScriptExecutor(this.system, this.logger, environment);
    return executor.executeScriptFile(this.filePath);
  }
}
