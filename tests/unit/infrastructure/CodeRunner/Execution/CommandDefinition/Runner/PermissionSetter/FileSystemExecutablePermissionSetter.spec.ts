import { describe, it, expect } from 'vitest';
import type { CodeRunErrorType } from '@/application/CodeRunner/CodeRunner';
import type { Logger } from '@/application/Common/Log/Logger';
import { FileSystemExecutablePermissionSetter } from '@/infrastructure/CodeRunner/Execution/CommandDefinition/Runner/PermissionSetter/FileSystemExecutablePermissionSetter';
import type { ScriptFileExecutionOutcome } from '@/infrastructure/CodeRunner/Execution/ScriptFileExecutor';
import type { SystemOperations } from '@/infrastructure/CodeRunner/System/SystemOperations';
import { expectTrue } from '@tests/shared/Assertions/ExpectTrue';
import { FileSystemOpsStub } from '@tests/unit/shared/Stubs/FileSystemOpsStub';
import { LoggerStub } from '@tests/unit/shared/Stubs/LoggerStub';
import { SystemOperationsStub } from '@tests/unit/shared/Stubs/SystemOperationsStub';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';

describe('FileSystemExecutablePermissionSetter', () => {
  describe('makeFileExecutable', () => {
    it('sets permissions on the specified file', async () => {
      // arrange
      const expectedFilePath = 'expected-file-path';
      const fileSystem = new FileSystemOpsStub();
      const context = new TestContext()
        .withFilePath(expectedFilePath)
        .withSystemOperations(new SystemOperationsStub().withFileSystem(fileSystem));

      // act
      await context.makeFileExecutable();

      // assert
      const calls = fileSystem.callHistory.filter((call) => call.methodName === 'setFilePermissions');
      expect(calls.length).to.equal(1);
      const [actualFilePath] = calls[0].args;
      expect(actualFilePath).to.equal(expectedFilePath);
    });

    it('applies the correct permissions mode', async () => {
      // arrange
      const expectedMode = '755';
      const fileSystem = new FileSystemOpsStub();
      const context = new TestContext()
        .withSystemOperations(new SystemOperationsStub().withFileSystem(fileSystem));

      // act
      await context.makeFileExecutable();

      // assert
      const calls = fileSystem.callHistory.filter((call) => call.methodName === 'setFilePermissions');
      expect(calls.length).to.equal(1);
      const [, actualMode] = calls[0].args;
      expect(actualMode).to.equal(expectedMode);
    });

    it('reports success when permissions are set without errors', async () => {
      // arrange
      const fileSystem = new FileSystemOpsStub();
      fileSystem.setFilePermissions = () => Promise.resolve();
      const context = new TestContext()
        .withSystemOperations(new SystemOperationsStub().withFileSystem(fileSystem));

      // act
      const result = await context.makeFileExecutable();

      // assert
      expectTrue(result.success);
      expect(result.error).to.equal(undefined);
    });

    describe('error handling', () => {
      it('returns error expected error message when filesystem throws', async () => {
        // arrange
        const thrownErrorMessage = 'File system error';
        const expectedErrorMessage = `Error setting script file permission: ${thrownErrorMessage}`;
        const fileSystem = new FileSystemOpsStub();
        fileSystem.setFilePermissions = () => Promise.reject(new Error(thrownErrorMessage));
        const context = new TestContext()
          .withSystemOperations(new SystemOperationsStub().withFileSystem(fileSystem));

        // act
        const result = await context.makeFileExecutable();

        // assert
        expect(result.success).to.equal(false);
        expectExists(result.error);
        expect(result.error.message).to.equal(expectedErrorMessage);
      });

      it('returns expected error type when filesystem throws', async () => {
        // arrange
        const expectedErrorType: CodeRunErrorType = 'FilePermissionChangeError';
        const fileSystem = new FileSystemOpsStub();
        fileSystem.setFilePermissions = () => Promise.reject(new Error('File system error'));
        const context = new TestContext()
          .withSystemOperations(new SystemOperationsStub().withFileSystem(fileSystem));

        // act
        const result = await context.makeFileExecutable();

        // assert
        expect(result.success).to.equal(false);
        expectExists(result.error);
        const actualErrorType = result.error.type;
        expect(actualErrorType).to.equal(expectedErrorType);
      });

      it('logs error when filesystem throws', async () => {
        // arrange
        const thrownErrorMessage = 'File system error';
        const logger = new LoggerStub();
        const fileSystem = new FileSystemOpsStub();
        fileSystem.setFilePermissions = () => Promise.reject(new Error(thrownErrorMessage));
        const context = new TestContext()
          .withLogger(logger)
          .withSystemOperations(new SystemOperationsStub().withFileSystem(fileSystem));

        // act
        await context.makeFileExecutable();

        // assert
        logger.assertLogsContainMessagePart('error', thrownErrorMessage);
      });
    });
  });
});

class TestContext {
  private filePath = `[${TestContext.name}] /file/path`;

  private systemOperations: SystemOperations = new SystemOperationsStub();

  private logger: Logger = new LoggerStub();

  public withFilePath(filePath: string): this {
    this.filePath = filePath;
    return this;
  }

  public withLogger(logger: Logger): this {
    this.logger = logger;
    return this;
  }

  public withSystemOperations(systemOperations: SystemOperations): this {
    this.systemOperations = systemOperations;
    return this;
  }

  public makeFileExecutable(): Promise<ScriptFileExecutionOutcome> {
    const sut = new FileSystemExecutablePermissionSetter(
      this.systemOperations,
      this.logger,
    );
    return sut.makeFileExecutable(this.filePath);
  }
}
