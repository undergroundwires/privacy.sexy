import { it, describe, expect } from 'vitest';
import type { Logger } from '@/application/Common/Log/Logger';
import { LoggerStub } from '@tests/unit/shared/Stubs/LoggerStub';
import { ApplicationDirectoryProviderStub } from '@tests/unit/shared/Stubs/ApplicationDirectoryProviderStub';
import type { ApplicationDirectoryProvider } from '@/infrastructure/FileSystem/Directory/ApplicationDirectoryProvider';
import type { FileSystemOperations } from '@/infrastructure/FileSystem/FileSystemOperations';
import { FileSystemOperationsStub } from '@tests/unit/shared/Stubs/FileSystemOperationsStub';
import type { FileSystemAccessorWithRetry } from '@/presentation/electron/main/Update/ManualUpdater/FileSystemAccessorWithRetry';
import { FileSystemAccessorWithRetryStub } from '@tests/unit/shared/Stubs/FileSystemAccessorWithRetryStub';
import { InstallerFileSuffix, provideUpdateInstallationFilepath } from '@/presentation/electron/main/Update/ManualUpdater/InstallationFiles/InstallationFilepathProvider';
import { expectThrowsAsync } from '@tests/shared/Assertions/ExpectThrowsAsync';
import { collectExceptionAsync } from '@tests/unit/shared/ExceptionCollector';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';

describe('InstallationFilePathProvider', () => {
  describe('provideUpdateInstallationFilePath', () => {
    it('returns correct filepath', async () => {
      // arrange
      const version = '1.2.3';
      const baseDirectoryPath = '/updates';
      const pathSegmentSeparator = '/separator/';
      const expectedPath = [
        baseDirectoryPath, pathSegmentSeparator, version, InstallerFileSuffix,
      ].join('');
      const fileSystemStub = new FileSystemOperationsStub()
        .withDefaultSeparator(pathSegmentSeparator);
      const directoryProviderStub = new ApplicationDirectoryProviderStub()
        .withDirectoryPath('update-installation-files', baseDirectoryPath);
      const context = new TestContext()
        .withFileSystem(fileSystemStub)
        .withDirectoryProvider(directoryProviderStub)
        .withVersion(version);
      // act
      const actualPath = await context.run();
      // assert
      expect(actualPath).to.equal(expectedPath);
    });
    it('checks if file exists at correct path', async () => {
      // arrange
      const version = '1.2.3';
      const baseDirectoryPath = '/updates';
      const pathSegmentSeparator = '/separator/';
      const expectedPath = [
        baseDirectoryPath, pathSegmentSeparator, version, InstallerFileSuffix,
      ].join('');
      const fileSystemStub = new FileSystemOperationsStub()
        .withDefaultSeparator(pathSegmentSeparator);
      const directoryProviderStub = new ApplicationDirectoryProviderStub()
        .withDirectoryPath('update-installation-files', baseDirectoryPath);
      const context = new TestContext()
        .withFileSystem(fileSystemStub)
        .withDirectoryProvider(directoryProviderStub)
        .withVersion(version);
      // act
      await context.run();
      // assert
      const calls = fileSystemStub.callHistory.filter((c) => c.methodName === 'isFileAvailable');
      expect(calls).to.have.lengthOf(1);
      const [actualFilePath] = calls[0].args;
      expect(actualFilePath).to.equal(expectedPath);
    });
    it('deletes file at correct path', async () => {
      // arrange
      const version = '1.2.3';
      const baseDirectoryPath = '/updates';
      const pathSegmentSeparator = '/separator/';
      const expectedPath = [
        baseDirectoryPath, pathSegmentSeparator, version, InstallerFileSuffix,
      ].join('');
      const isFileAvailable = true;
      const fileSystemStub = new FileSystemOperationsStub()
        .withFileAvailability(expectedPath, isFileAvailable)
        .withDefaultSeparator(pathSegmentSeparator);
      const directoryProviderStub = new ApplicationDirectoryProviderStub()
        .withDirectoryPath('update-installation-files', baseDirectoryPath);
      const context = new TestContext()
        .withFileSystem(fileSystemStub)
        .withDirectoryProvider(directoryProviderStub)
        .withVersion(version);
      // act
      await context.run();
      // assert
      const calls = fileSystemStub.callHistory.filter((c) => c.methodName === 'deletePath');
      expect(calls).to.have.lengthOf(1);
      const [deletedFilePath] = calls[0].args;
      expect(deletedFilePath).to.equal(expectedPath);
    });
    it('deletes existing file', async () => {
      // arrange
      const isFileAvailable = true;
      const fileSystemStub = new FileSystemOperationsStub();
      fileSystemStub.isFileAvailable = () => Promise.resolve(isFileAvailable);
      const context = new TestContext()
        .withFileSystem(fileSystemStub);
      // act
      await context.run();
      // assert
      const calls = fileSystemStub.callHistory.filter((c) => c.methodName === 'deletePath');
      expect(calls).to.have.lengthOf(1);
    });
    it('does not attempt to delete non-existent file', async () => {
      // arrange
      const isFileAvailable = false;
      const fileSystemStub = new FileSystemOperationsStub();
      fileSystemStub.isFileAvailable = () => Promise.resolve(isFileAvailable);
      const context = new TestContext()
        .withFileSystem(fileSystemStub);
      // act
      await context.run();
      // assert
      const calls = fileSystemStub.callHistory.filter((c) => c.methodName === 'deletePath');
      expect(calls).to.have.lengthOf(0);
    });
    describe('file system error handling', () => {
      it('retries on file deletion failure', async () => {
        // arrange
        const forcedRetries = 2;
        const expectedTotalCalls = forcedRetries + 1;
        const isFileAvailable = true;
        const accessorStub = new FileSystemAccessorWithRetryStub()
          .withAlwaysRetry(forcedRetries);
        const fileSystemStub = new FileSystemOperationsStub();
        fileSystemStub.isFileAvailable = () => Promise.resolve(isFileAvailable);
        const context = new TestContext()
          .withFileSystem(fileSystemStub)
          .withAccessor(accessorStub.get());
        // act
        await context.run();
        // assert
        const calls = fileSystemStub.callHistory
          .filter((c) => c.methodName === 'deletePath');
        expect(calls).to.have.lengthOf(expectedTotalCalls);
      });
    });
    describe('error handling', () => {
      it('throws when directory provision fails', async () => {
        // arrange
        const expectedErrorMessage = 'Failed to provide download directory.';
        const directoryProvider = new ApplicationDirectoryProviderStub()
          .withFailure();
        const context = new TestContext()
          .withDirectoryProvider(directoryProvider);
        // act
        const act = () => context.run();
        // assert
        await expectThrowsAsync(act, expectedErrorMessage);
      });
      it('throws on file availability check failure', async () => {
        // arrange
        const expectedErrorMessage = 'File availability check failed';
        const fileSystemStub = new FileSystemOperationsStub();
        fileSystemStub.isFileAvailable = () => {
          return Promise.reject(new Error(expectedErrorMessage));
        };
        const context = new TestContext()
          .withFileSystem(fileSystemStub);
        // act
        const act = () => context.run();
        // assert
        await expectThrowsAsync(act, expectedErrorMessage);
      });
      it('throws on existing file deletion failure', async () => {
        // arrange
        const expectedErrorMessagePart = 'Failed to prepare the file path for the installer';
        const fileSystemStub = new FileSystemOperationsStub();
        fileSystemStub.deletePath = () => {
          return Promise.reject(new Error('Internal error'));
        };
        const context = new TestContext()
          .withFileSystem(fileSystemStub);
        // act
        const act = () => context.run();
        // assert
        const error = await collectExceptionAsync(act);
        expectExists(error, formatAssertionMessage([
          `File system calls: ${fileSystemStub.methodCalls}`,
        ]));
        expect(error.message).to.include(expectedErrorMessagePart);
      });
    });
  });
});

class TestContext {
  private version = '3.5.5';

  private logger: Logger = new LoggerStub();

  private directoryProvider
  : ApplicationDirectoryProvider = new ApplicationDirectoryProviderStub();

  private fileSystem: FileSystemOperations = new FileSystemOperationsStub();

  private accessor: FileSystemAccessorWithRetry = new FileSystemAccessorWithRetryStub().get();

  public withVersion(version: string): this {
    this.version = version;
    return this;
  }

  public withAccessor(accessor: FileSystemAccessorWithRetry): this {
    this.accessor = accessor;
    return this;
  }

  public withDirectoryProvider(directoryProvider: ApplicationDirectoryProvider): this {
    this.directoryProvider = directoryProvider;
    return this;
  }

  public withFileSystem(fileSystem: FileSystemOperations): this {
    this.fileSystem = fileSystem;
    return this;
  }

  public run() {
    return provideUpdateInstallationFilepath(this.version, {
      logger: this.logger,
      directoryProvider: this.directoryProvider,
      fileSystem: this.fileSystem,
      accessFileSystemWithRetry: this.accessor,
    });
  }
}
