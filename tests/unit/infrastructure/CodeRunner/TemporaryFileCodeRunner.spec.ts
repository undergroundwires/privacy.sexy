import { describe, it, expect } from 'vitest';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { FileSystemOps, SystemOperations } from '@/infrastructure/CodeRunner/SystemOperations/SystemOperations';
import { FileNameGenerator, TemporaryFileCodeRunner } from '@/infrastructure/CodeRunner/TemporaryFileCodeRunner';
import { expectThrowsAsync } from '@tests/shared/Assertions/ExpectThrowsAsync';
import { SystemOperationsStub } from '@tests/unit/shared/Stubs/SystemOperationsStub';
import { OperatingSystemOpsStub } from '@tests/unit/shared/Stubs/OperatingSystemOpsStub';
import { LocationOpsStub } from '@tests/unit/shared/Stubs/LocationOpsStub';
import { FileSystemOpsStub } from '@tests/unit/shared/Stubs/FileSystemOpsStub';
import { CommandOpsStub } from '@tests/unit/shared/Stubs/CommandOpsStub';
import { FunctionKeys } from '@/TypeHelpers';
import { AllSupportedOperatingSystems, SupportedOperatingSystem } from '@tests/shared/TestCases/SupportedOperatingSystems';
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';
import { LoggerStub } from '@tests/unit/shared/Stubs/LoggerStub';
import { Logger } from '@/application/Common/Log/Logger';

describe('TemporaryFileCodeRunner', () => {
  describe('runCode', () => {
    describe('directory creation', () => {
      it('creates temporary directory recursively', async () => {
        // arrange
        const expectedDir = 'expected-dir';
        const expectedIsRecursive = true;

        const folderName = 'privacy.sexy';
        const temporaryDirName = 'tmp';
        const filesystem = new FileSystemOpsStub();
        const context = new CodeRunnerTestSetup()
          .withSystemOperationsStub((ops) => ops
            .withOperatingSystem(
              new OperatingSystemOpsStub()
                .withTemporaryDirectoryResult(temporaryDirName),
            )
            .withLocation(
              new LocationOpsStub()
                .withJoinResult(expectedDir, temporaryDirName, folderName),
            )
            .withFileSystem(filesystem));

        // act
        await context
          .withFolderName(folderName)
          .runCode();

        // assert
        const calls = filesystem.callHistory.filter((call) => call.methodName === 'createDirectory');
        expect(calls.length).to.equal(1);
        const [actualPath, actualIsRecursive] = calls[0].args;
        expect(actualPath).to.equal(expectedDir);
        expect(actualIsRecursive).to.equal(expectedIsRecursive);
      });
    });
    describe('file creation', () => {
      it('creates a file with expected code', async () => {
        // arrange
        const expectedCode = 'expected-code';
        const filesystem = new FileSystemOpsStub();
        const context = new CodeRunnerTestSetup()
          .withSystemOperationsStub((ops) => ops
            .withFileSystem(filesystem));
        // act
        await context
          .withCode(expectedCode)
          .runCode();

        // assert
        const calls = filesystem.callHistory.filter((call) => call.methodName === 'writeToFile');
        expect(calls.length).to.equal(1);
        const [, actualData] = calls[0].args;
        expect(actualData).to.equal(expectedCode);
      });
      it('generates file name for correct operating system', async () => {
        // arrange
        const expectedOperatingSystem = OperatingSystem.macOS;
        const calls = new Array<OperatingSystem>();
        const fileNameGenerator: FileNameGenerator = (operatingSystem) => {
          calls.push(operatingSystem);
          return 'unimportant file name';
        };
        const context = new CodeRunnerTestSetup()
          .withOs(expectedOperatingSystem)
          .withFileNameGenerator(fileNameGenerator);

        // act
        await context.runCode();

        // assert
        expect(calls).to.have.lengthOf(1);
        const [actualOperatingSystem] = calls;
        expect(actualOperatingSystem).to.equal(expectedOperatingSystem);
      });
      it('creates file in expected directory', async () => {
        // arrange
        const pathSegmentSeparator = '/PATH-SEGMENT-SEPARATOR/';
        const temporaryDirName = '/tmp';
        const folderName = 'privacy.sexy';
        const expectedDirectory = [temporaryDirName, folderName].join(pathSegmentSeparator);
        const filesystem = new FileSystemOpsStub();
        const context = new CodeRunnerTestSetup()
          .withSystemOperationsStub((ops) => ops
            .withOperatingSystem(
              new OperatingSystemOpsStub()
                .withTemporaryDirectoryResult(temporaryDirName),
            )
            .withLocation(
              new LocationOpsStub().withDefaultSeparator(pathSegmentSeparator),
            )
            .withFileSystem(filesystem));

        // act
        await context
          .withFolderName(folderName)
          .runCode();

        // assert
        const calls = filesystem.callHistory.filter((call) => call.methodName === 'writeToFile');
        expect(calls.length).to.equal(1);
        const [actualFilePath] = calls[0].args;
        const actualDirectory = actualFilePath
          .split(pathSegmentSeparator)
          .slice(0, -1)
          .join(pathSegmentSeparator);
        expect(actualDirectory).to.equal(expectedDirectory, formatAssertionMessage([
          `Actual file path: ${actualFilePath}`,
        ]));
      });
      it('creates file with expected file name', async () => {
        // arrange
        const pathSegmentSeparator = '/PATH-SEGMENT-SEPARATOR/';
        const filesystem = new FileSystemOpsStub();
        const expectedFileName = 'expected-script-file-name';
        const context = new CodeRunnerTestSetup()
          .withFileNameGenerator(() => expectedFileName)
          .withSystemOperationsStub((ops) => ops
            .withFileSystem(filesystem)
            .withLocation(new LocationOpsStub().withDefaultSeparator(pathSegmentSeparator)));

        // act
        await context.runCode();

        // assert
        const calls = filesystem.callHistory.filter((call) => call.methodName === 'writeToFile');
        expect(calls.length).to.equal(1);
        const [actualFilePath] = calls[0].args;
        const actualFileName = actualFilePath
          .split(pathSegmentSeparator)
          .pop();
        expect(actualFileName).to.equal(actualFileName, formatAssertionMessage([
          `Actual file path: ${actualFilePath}`,
        ]));
      });
    });
    describe('file permissions', () => {
      it('sets correct permissions', async () => {
        // arrange
        const expectedMode = '755';
        const filesystem = new FileSystemOpsStub();
        const context = new CodeRunnerTestSetup()
          .withSystemOperationsStub((ops) => ops.withFileSystem(filesystem));

        // act
        await context.runCode();

        // assert
        const calls = filesystem.callHistory.filter((call) => call.methodName === 'setFilePermissions');
        expect(calls.length).to.equal(1);
        const [, actualMode] = calls[0].args;
        expect(actualMode).to.equal(expectedMode);
      });
      it('sets correct permissions on correct file', async () => {
        // arrange
        const expectedFilePath = 'expected-file-path';
        const filesystem = new FileSystemOpsStub();
        const extension = '.sh';
        const expectedName = `run.${extension}`;
        const folderName = 'privacy.sexy';
        const temporaryDirName = 'tmp';
        const context = new CodeRunnerTestSetup()
          .withSystemOperationsStub((ops) => ops
            .withOperatingSystem(
              new OperatingSystemOpsStub()
                .withTemporaryDirectoryResult(temporaryDirName),
            )
            .withLocation(
              new LocationOpsStub()
                .withJoinResult('folder', temporaryDirName, folderName)
                .withJoinResult(expectedFilePath, 'folder', expectedName),
            )
            .withFileSystem(filesystem));

        // act
        await context
          .withFolderName(folderName)
          .withFileNameGenerator(() => expectedName)
          .runCode();

        // assert
        const calls = filesystem.callHistory.filter((call) => call.methodName === 'setFilePermissions');
        expect(calls.length).to.equal(1);
        const [actualFilePath] = calls[0].args;
        expect(actualFilePath).to.equal(expectedFilePath);
      });
    });
    describe('file execution', () => {
      describe('executes correct command', () => {
        // arrange
        const filePath = 'executed-file-path';
        const testScenarios: Record<SupportedOperatingSystem, string> = {
          [OperatingSystem.Windows]: filePath,
          [OperatingSystem.macOS]: `open -a Terminal.app ${filePath}`,
          [OperatingSystem.Linux]: `x-terminal-emulator -e '${filePath}'`,
        };
        AllSupportedOperatingSystems.forEach((operatingSystem) => {
          it(`returns correctly for ${OperatingSystem[operatingSystem]}`, async () => {
            // arrange
            const expectedCommand = testScenarios[operatingSystem];
            const command = new CommandOpsStub();
            const context = new CodeRunnerTestSetup()
              .withFileNameGenerator(() => filePath)
              .withSystemOperationsStub((ops) => ops
                .withLocation(
                  new LocationOpsStub()
                    .withJoinResultSequence('non-important-folder-name', filePath),
                )
                .withCommand(command));

            // act
            await context
              .withOs(operatingSystem)
              .runCode();

            // assert
            const calls = command.callHistory.filter((c) => c.methodName === 'execute');
            expect(calls.length).to.equal(1);
            const [actualCommand] = calls[0].args;
            expect(actualCommand).to.equal(expectedCommand);
          });
        });
      });
      it('runs in expected order', async () => { // verifies correct `async`, `await` usage.
        const expectedOrder: readonly FunctionKeys<FileSystemOps>[] = [
          'createDirectory',
          'writeToFile',
          'setFilePermissions',
        ];
        const fileSystem = new FileSystemOpsStub();
        const context = new CodeRunnerTestSetup()
          .withSystemOperationsStub((ops) => ops
            .withFileSystem(fileSystem));

        // act
        await context.runCode();

        // assert
        const actualOrder = fileSystem.callHistory
          .map((c) => c.methodName)
          .filter((command) => expectedOrder.includes(command));
        expect(expectedOrder).to.deep.equal(actualOrder);
      });
    });
    describe('throws with invalid OS', () => {
      const testScenarios: ReadonlyArray<{
        readonly description: string;
        readonly invalidOs: OperatingSystem;
        readonly expectedError: string;
      }> = [
        (() => {
          const unsupportedOs = OperatingSystem.Android;
          return {
            description: 'unsupported OS',
            invalidOs: unsupportedOs,
            expectedError: `unsupported os: ${OperatingSystem[unsupportedOs]}`,
          };
        })(),
      ];
      testScenarios.forEach(({ description, invalidOs, expectedError }) => {
        it(description, async () => {
          // arrange
          const context = new CodeRunnerTestSetup()
            .withOs(invalidOs);
          // act
          const act = async () => { await context.runCode(); };
          // assert
          await expectThrowsAsync(act, expectedError);
        });
      });
    });
  });
});

class CodeRunnerTestSetup {
  private code = `[${CodeRunnerTestSetup.name}]code`;

  private folderName = `[${CodeRunnerTestSetup.name}]folderName`;

  private fileNameGenerator: FileNameGenerator = () => `[${CodeRunnerTestSetup.name}]file-name-stub`;

  private os: OperatingSystem = OperatingSystem.Windows;

  private systemOperations: SystemOperations = new SystemOperationsStub();

  private logger: Logger = new LoggerStub();

  public async runCode(): Promise<void> {
    const runner = new TemporaryFileCodeRunner(
      this.systemOperations,
      this.fileNameGenerator,
      this.logger,
    );
    await runner.runCode(this.code, this.folderName, this.os);
  }

  public withSystemOperations(
    systemOperations: SystemOperations,
  ): this {
    this.systemOperations = systemOperations;
    return this;
  }

  public withSystemOperationsStub(
    setup: (stub: SystemOperationsStub) => SystemOperationsStub,
  ): this {
    const stub = setup(new SystemOperationsStub());
    return this.withSystemOperations(stub);
  }

  public withOs(os: OperatingSystem): this {
    this.os = os;
    return this;
  }

  public withFolderName(folderName: string): this {
    this.folderName = folderName;
    return this;
  }

  public withCode(code: string): this {
    this.code = code;
    return this;
  }

  public withFileNameGenerator(fileNameGenerator: FileNameGenerator): this {
    this.fileNameGenerator = fileNameGenerator;
    return this;
  }
}
