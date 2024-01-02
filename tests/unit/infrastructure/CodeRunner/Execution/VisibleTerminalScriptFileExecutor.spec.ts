import { describe, it, expect } from 'vitest';
import { expectThrowsAsync } from '@tests/shared/Assertions/ExpectThrowsAsync';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { AllSupportedOperatingSystems, SupportedOperatingSystem } from '@tests/shared/TestCases/SupportedOperatingSystems';
import { VisibleTerminalScriptExecutor } from '@/infrastructure/CodeRunner/Execution/VisibleTerminalScriptFileExecutor';
import { RuntimeEnvironmentStub } from '@tests/unit/shared/Stubs/RuntimeEnvironmentStub';
import { LoggerStub } from '@tests/unit/shared/Stubs/LoggerStub';
import { SystemOperationsStub } from '@tests/unit/shared/Stubs/SystemOperationsStub';
import { CommandOpsStub } from '@tests/unit/shared/Stubs/CommandOpsStub';
import { SystemOperations } from '@/infrastructure/CodeRunner/SystemOperations/SystemOperations';
import { FileSystemOpsStub } from '@tests/unit/shared/Stubs/FileSystemOpsStub';

describe('VisibleTerminalScriptFileExecutor', () => {
  describe('executeScriptFile', () => {
    describe('throws error for invalid operating systems', () => {
      const testScenarios: ReadonlyArray<{
        readonly description: string;
        readonly invalidOs?: OperatingSystem;
        readonly expectedError: string;
      }> = [
        (() => {
          const unsupportedOs = OperatingSystem.Android;
          return {
            description: 'unsupported OS',
            invalidOs: unsupportedOs,
            expectedError: `Unsupported operating system: ${OperatingSystem[unsupportedOs]}`,
          };
        })(),
        {
          description: 'undefined OS',
          invalidOs: undefined,
          expectedError: 'Unknown operating system',
        },
      ];
      testScenarios.forEach(({ description, invalidOs, expectedError }) => {
        it(description, async () => {
          // arrange
          const context = new ScriptFileTestSetup()
            .withOs(invalidOs);
          // act
          const act = async () => { await context.executeScriptFile(); };
          // assert
          await expectThrowsAsync(act, expectedError);
        });
      });
    });
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
            expectedCommand: '"file"',
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
            it(description, async () => {
              // arrange
              const command = new CommandOpsStub();
              const context = new ScriptFileTestSetup()
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
        const context = new ScriptFileTestSetup()
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
        const context = new ScriptFileTestSetup()
          .withSystemOperations(new SystemOperationsStub().withFileSystem(fileSystem));

        // act
        await context.executeScriptFile();

        // assert
        const calls = fileSystem.callHistory.filter((call) => call.methodName === 'setFilePermissions');
        expect(calls.length).to.equal(1);
        const [, actualMode] = calls[0].args;
        expect(actualMode).to.equal(expectedMode);
      });
      it('sets permissions on the correct file', async () => {
        // arrange
        const expectedFilePath = 'expected-file-path';
        const fileSystem = new FileSystemOpsStub();
        const context = new ScriptFileTestSetup()
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
  });
});

class ScriptFileTestSetup {
  private os?: OperatingSystem = OperatingSystem.Windows;

  private filePath = `[${ScriptFileTestSetup.name}] file path`;

  private system: SystemOperations = new SystemOperationsStub();

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

  public executeScriptFile(): Promise<void> {
    const environment = new RuntimeEnvironmentStub().withOs(this.os);
    const logger = new LoggerStub();
    const executor = new VisibleTerminalScriptExecutor(this.system, logger, environment);
    return executor.executeScriptFile(this.filePath);
  }
}
