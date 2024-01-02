import { describe, it, expect } from 'vitest';
import { FileSystemOps, SystemOperations } from '@/infrastructure/CodeRunner/SystemOperations/SystemOperations';
import { TemporaryFileCodeRunner } from '@/infrastructure/CodeRunner/TemporaryFileCodeRunner';
import { SystemOperationsStub } from '@tests/unit/shared/Stubs/SystemOperationsStub';
import { OperatingSystemOpsStub } from '@tests/unit/shared/Stubs/OperatingSystemOpsStub';
import { LocationOpsStub } from '@tests/unit/shared/Stubs/LocationOpsStub';
import { FunctionKeys } from '@/TypeHelpers';
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';
import { LoggerStub } from '@tests/unit/shared/Stubs/LoggerStub';
import { Logger } from '@/application/Common/Log/Logger';
import { FilenameGenerator } from '@/infrastructure/CodeRunner/Filename/FilenameGenerator';
import { FilenameGeneratorStub } from '@tests/unit/shared/Stubs/FilenameGeneratorStub';
import { ScriptFileExecutor } from '@/infrastructure/CodeRunner/Execution/ScriptFileExecutor';
import { ScriptFileExecutorStub } from '@tests/unit/shared/Stubs/ScriptFileExecutorStub';
import { FileSystemOpsStub } from '@tests/unit/shared/Stubs/FileSystemOpsStub';

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
        const expectedFilename = 'expected-script-file-name';
        const context = new CodeRunnerTestSetup()
          .withFileNameGenerator(new FilenameGeneratorStub().withFilename(expectedFilename))
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
      it('creates file after creating the directory', async () => {
        const expectedOrder: readonly FunctionKeys<FileSystemOps>[] = [
          'createDirectory',
          'writeToFile',
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
    describe('file execution', () => {
      it('executes correct file', async () => {
        // arrange
        const fileSystem = new FileSystemOpsStub();
        const fileExecutor = new ScriptFileExecutorStub();
        const context = new CodeRunnerTestSetup()
          .withSystemOperationsStub((ops) => ops.withFileSystem(fileSystem))
          .withFileExecutor(fileExecutor);

        // act
        await context.runCode();

        // assert
        const writeFileCalls = fileSystem.callHistory.filter((call) => call.methodName === 'writeToFile');
        expect(writeFileCalls.length).to.equal(1);
        const [expectedFilePath] = writeFileCalls[0].args;
        const execFileCalls = fileExecutor.callHistory.filter((call) => call.methodName === 'executeScriptFile');
        expect(execFileCalls.length).to.equal(1);
        const [actualPath] = execFileCalls[0].args;
        expect(actualPath).to.equal(expectedFilePath);
      });
      it('executes after creating the file', async () => {
        // arrange
        let isFileCreated = false;
        let isExecutedAfterCreation = false;
        const filesystem = new FileSystemOpsStub();
        filesystem.writeToFile = () => {
          isFileCreated = true;
          return Promise.resolve();
        };
        const fileExecutor = new ScriptFileExecutorStub();
        fileExecutor.executeScriptFile = () => {
          isExecutedAfterCreation = isFileCreated;
          return Promise.resolve();
        };
        const context = new CodeRunnerTestSetup()
          .withSystemOperationsStub((ops) => ops.withFileSystem(filesystem))
          .withFileExecutor(fileExecutor);

        // act
        await context.runCode();

        // assert
        expect(isExecutedAfterCreation).to.equal(true);
      });
    });
  });
});

class CodeRunnerTestSetup {
  private code = `[${CodeRunnerTestSetup.name}]code`;

  private folderName = `[${CodeRunnerTestSetup.name}]folderName`;

  private filenameGenerator: FilenameGenerator = new FilenameGeneratorStub();

  private systemOperations: SystemOperations = new SystemOperationsStub();

  private fileExecutor: ScriptFileExecutor = new ScriptFileExecutorStub();

  private logger: Logger = new LoggerStub();

  public async runCode(): Promise<void> {
    const runner = new TemporaryFileCodeRunner(
      this.systemOperations,
      this.filenameGenerator,
      this.logger,
      this.fileExecutor,
    );
    await runner.runCode(this.code, this.folderName);
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

  public withFolderName(folderName: string): this {
    this.folderName = folderName;
    return this;
  }

  public withFileExecutor(fileExecutor: ScriptFileExecutor): this {
    this.fileExecutor = fileExecutor;
    return this;
  }

  public withCode(code: string): this {
    this.code = code;
    return this;
  }

  public withFileNameGenerator(fileNameGenerator: FilenameGenerator): this {
    this.filenameGenerator = fileNameGenerator;
    return this;
  }
}
