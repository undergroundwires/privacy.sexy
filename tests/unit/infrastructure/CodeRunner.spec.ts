import { describe, it, expect } from 'vitest';
import { EnvironmentStub } from '@tests/unit/shared/Stubs/EnvironmentStub';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { CodeRunner } from '@/infrastructure/CodeRunner';
import { expectThrowsAsync } from '@tests/unit/shared/Assertions/ExpectThrowsAsync';
import { SystemOperationsStub } from '@tests/unit/shared/Stubs/SystemOperationsStub';
import { OperatingSystemOpsStub } from '@tests/unit/shared/Stubs/OperatingSystemOpsStub';
import { LocationOpsStub } from '@tests/unit/shared/Stubs/LocationOpsStub';
import { FileSystemOpsStub } from '@tests/unit/shared/Stubs/FileSystemOpsStub';
import { CommandOpsStub } from '@tests/unit/shared/Stubs/CommandOpsStub';
import { IFileSystemOps, ISystemOperations } from '@/infrastructure/Environment/SystemOperations/ISystemOperations';
import { FunctionKeys } from '@/TypeHelpers';
import { itEachAbsentObjectValue } from '@tests/unit/shared/TestCases/AbsentTests';

describe('CodeRunner', () => {
  describe('ctor throws if system is missing', () => {
    itEachAbsentObjectValue((absentValue) => {
      // arrange
      const expectedError = 'missing system operations';
      const environment = new EnvironmentStub()
        .withSystemOperations(absentValue);
      // act
      const act = () => new CodeRunner(environment);
      // assert
      expect(act).to.throw(expectedError);
    });
  });
  describe('runCode', () => {
    it('creates temporary directory recursively', async () => {
      // arrange
      const expectedDir = 'expected-dir';
      const expectedIsRecursive = true;

      const folderName = 'privacy.sexy';
      const temporaryDirName = 'tmp';
      const filesystem = new FileSystemOpsStub();
      const context = new TestContext()
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
    it('creates a file with expected code and path', async () => {
      // arrange
      const expectedCode = 'expected-code';
      const expectedFilePath = 'expected-file-path';

      const filesystem = new FileSystemOpsStub();
      const extension = '.sh';
      const expectedName = `run.${extension}`;
      const folderName = 'privacy.sexy';
      const temporaryDirName = 'tmp';
      const context = new TestContext()
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
        .withCode(expectedCode)
        .withFolderName(folderName)
        .withExtension(extension)
        .runCode();

      // assert
      const calls = filesystem.callHistory.filter((call) => call.methodName === 'writeToFile');
      expect(calls.length).to.equal(1);
      const [actualFilePath, actualData] = calls[0].args;
      expect(actualFilePath).to.equal(expectedFilePath);
      expect(actualData).to.equal(expectedCode);
    });
    it('set file permissions as expected', async () => {
      // arrange
      const expectedMode = '755';
      const expectedFilePath = 'expected-file-path';

      const filesystem = new FileSystemOpsStub();
      const extension = '.sh';
      const expectedName = `run.${extension}`;
      const folderName = 'privacy.sexy';
      const temporaryDirName = 'tmp';
      const context = new TestContext()
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
        .withExtension(extension)
        .runCode();

      // assert
      const calls = filesystem.callHistory.filter((call) => call.methodName === 'setFilePermissions');
      expect(calls.length).to.equal(1);
      const [actualFilePath, actualMode] = calls[0].args;
      expect(actualFilePath).to.equal(expectedFilePath);
      expect(actualMode).to.equal(expectedMode);
    });
    describe('executes as expected', () => {
      // arrange
      const filePath = 'expected-file-path';
      interface IExecutionTestCase {
        readonly givenOs: OperatingSystem;
        readonly expectedCommand: string;
      }
      const testData: readonly IExecutionTestCase[] = [
        {
          givenOs: OperatingSystem.Windows,
          expectedCommand: filePath,
        },
        {
          givenOs: OperatingSystem.macOS,
          expectedCommand: `open -a Terminal.app ${filePath}`,
        },
        {
          givenOs: OperatingSystem.Linux,
          expectedCommand: `x-terminal-emulator -e '${filePath}'`,
        },
      ];
      for (const { givenOs, expectedCommand } of testData) {
        it(`returns ${expectedCommand} on ${OperatingSystem[givenOs]}`, async () => {
          const command = new CommandOpsStub();
          const context = new TestContext()
            .withSystemOperationsStub((ops) => ops
              .withLocation(
                new LocationOpsStub()
                  .withJoinResultSequence('non-important-folder-name', filePath),
              )
              .withCommand(command));

          // act
          await context
            .withOs(givenOs)
            .runCode();

          // assert
          const calls = command.callHistory.filter((c) => c.methodName === 'execute');
          expect(calls.length).to.equal(1);
          const [actualCommand] = calls[0].args;
          expect(actualCommand).to.equal(expectedCommand);
        });
      }
    });
    it('runs in expected order', async () => { // verifies correct `async`, `await` usage.
      const expectedOrder: readonly FunctionKeys<IFileSystemOps>[] = [
        'createDirectory',
        'writeToFile',
        'setFilePermissions',
      ];
      const fileSystem = new FileSystemOpsStub();
      const context = new TestContext()
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
    it('throws with unsupported os', async () => {
      // arrange
      const unknownOs = OperatingSystem.Android;
      const expectedError = `unsupported os: ${OperatingSystem[unknownOs]}`;
      const context = new TestContext()
        .withOs(unknownOs);
      // act
      const act = async () => { await context.runCode(); };
      // assert
      expectThrowsAsync(act, expectedError);
    });
  });
});

class TestContext {
  private code = 'code';

  private folderName = 'folderName';

  private fileExtension = 'fileExtension';

  private os = OperatingSystem.Windows;

  private systemOperations: ISystemOperations = new SystemOperationsStub();

  public async runCode(): Promise<void> {
    const environment = new EnvironmentStub()
      .withOs(this.os)
      .withSystemOperations(this.systemOperations);
    const runner = new CodeRunner(environment);
    await runner.runCode(this.code, this.folderName, this.fileExtension);
  }

  public withSystemOperations(
    systemOperations: ISystemOperations,
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

  public withOs(os: OperatingSystem) {
    this.os = os;
    return this;
  }

  public withFolderName(folderName: string) {
    this.folderName = folderName;
    return this;
  }

  public withCode(code: string) {
    this.code = code;
    return this;
  }

  public withExtension(fileExtension: string) {
    this.fileExtension = fileExtension;
    return this;
  }
}
