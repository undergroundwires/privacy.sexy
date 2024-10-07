import { it, describe, expect } from 'vitest';
import type { Logger } from '@/application/Common/Log/Logger';
import type { ApplicationDirectoryProvider } from '@/infrastructure/FileSystem/Directory/ApplicationDirectoryProvider';
import type { FileSystemOperations } from '@/infrastructure/FileSystem/FileSystemOperations';
import { ApplicationDirectoryProviderStub } from '@tests/unit/shared/Stubs/ApplicationDirectoryProviderStub';
import { LoggerStub } from '@tests/unit/shared/Stubs/LoggerStub';
import { FileSystemOperationsStub } from '@tests/unit/shared/Stubs/FileSystemOperationsStub';
import { clearUpdateInstallationFiles } from '@/presentation/electron/main/Update/ManualUpdater/InstallationFiles/InstallationFileCleaner';
import { expectThrowsAsync } from '@tests/shared/Assertions/ExpectThrowsAsync';
import { collectExceptionAsync } from '@tests/unit/shared/ExceptionCollector';
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import { indentText } from '@/application/Common/Text/IndentText';

describe('InstallationFileCleaner', () => {
  describe('clearUpdateInstallationFiles', () => {
    describe('deleting files', () => {
      it('deletes all update installation files and directories', async () => {
        // arrange
        const expectedDirectoryEntries = ['file1', 'file2', 'file3', 'directory1', 'directory2'];
        const directoryPath = 'directory-name';
        const pathSeparator = 'test-separator';
        const directoryProviderStub = new ApplicationDirectoryProviderStub()
          .withDirectoryPath('update-installation-files', directoryPath);
        const fileSystemStub = new FileSystemOperationsStub()
          .withDefaultSeparator(pathSeparator)
          .withDirectoryContents(directoryPath, expectedDirectoryEntries);
        const context = new TestContext()
          .withDirectoryProvider(directoryProviderStub)
          .withFileSystem(fileSystemStub);
        // act
        await context.run();
        // assert
        const actualDeletedEntries = fileSystemStub.callHistory
          .filter((c) => c.methodName === 'deletePath')
          .map((c) => c.args[0])
          .map((path) => path.split(pathSeparator).pop());
        expect(expectedDirectoryEntries.sort()).to.deep.equal(actualDeletedEntries.sort());
      });
      it('deletes files at the correct absolute paths', async () => {
        // arrange
        const directoryItemName = 'expected-item-name';
        const directoryPath = 'expected-directory';
        const pathSeparator = '[expected-separator]';
        const expectedFullPath = [directoryPath, directoryItemName].join(pathSeparator);
        const directoryProviderStub = new ApplicationDirectoryProviderStub()
          .withDirectoryPath('update-installation-files', directoryPath);
        const fileSystemStub = new FileSystemOperationsStub()
          .withDefaultSeparator(pathSeparator)
          .withDirectoryContents(directoryPath, [directoryItemName]);
        const context = new TestContext()
          .withDirectoryProvider(directoryProviderStub)
          .withFileSystem(fileSystemStub);
        // act
        await context.run();
        // assert
        const actualDeletedEntries = fileSystemStub.callHistory
          .filter((c) => c.methodName === 'deletePath')
          .map((c) => c.args[0]);
        expect(actualDeletedEntries).to.have.lengthOf(1);
        const actualFullPath = actualDeletedEntries[0];
        expect(actualFullPath).to.equal(expectedFullPath);
      });
      it('continues deleting other items if one cannot be deleted', async () => {
        // arrange
        const expectedDeletedItems = ['success-1', 'success-2', 'success-3'];
        const expectedDirectoryEntries = ['fail-1', ...expectedDeletedItems, 'fail-2'];
        const directoryPath = 'directory-name';
        const pathSeparator = 'test-separator';
        const directoryProviderStub = new ApplicationDirectoryProviderStub()
          .withDirectoryPath('update-installation-files', directoryPath);
        const fileSystemStub = new FileSystemOperationsStub()
          .withDefaultSeparator(pathSeparator)
          .withDirectoryContents(directoryPath, expectedDirectoryEntries);
        fileSystemStub.deletePath = async (path) => {
          await FileSystemOperationsStub.prototype
            .deletePath.call(fileSystemStub, path); // register call history
          if (expectedDeletedItems.some((item) => path.endsWith(item))) {
            return;
          }
          throw new Error(`Path is not configured to succeed, so it fails: ${path}`);
        };
        const context = new TestContext()
          .withDirectoryProvider(directoryProviderStub)
          .withFileSystem(fileSystemStub);
        // act
        try {
          await context.run();
        } catch { /* Swallow */ }
        // assert
        const actualDeletedEntries = fileSystemStub.callHistory
          .filter((c) => c.methodName === 'deletePath')
          .map((c) => c.args[0])
          .map((path) => path.split(pathSeparator).pop());
        expect(expectedDirectoryEntries.sort()).to.deep.equal(actualDeletedEntries.sort());
      });
    });
    it('does nothing if directory is empty', async () => {
      // arrange
      const directoryPath = 'directory-path';
      const directoryProviderStub = new ApplicationDirectoryProviderStub()
        .withDirectoryPath('update-installation-files', directoryPath);
      const fileSystemStub = new FileSystemOperationsStub()
        .withDirectoryContents(directoryPath, []);
      const context = new TestContext()
        .withDirectoryProvider(directoryProviderStub)
        .withFileSystem(fileSystemStub);
      // act
      await context.run();
      // assert
      const actualDeletedEntries = fileSystemStub.callHistory
        .filter((c) => c.methodName === 'deletePath');
      expect(actualDeletedEntries).to.have.lengthOf(0);
    });
    describe('error handling', () => {
      it('throws if installation directory cannot be provided', async () => {
        // arrange
        const expectedError = 'Cannot locate the installation files directory path';
        const directoryProviderStub = new ApplicationDirectoryProviderStub()
          .withFailure();
        const context = new TestContext()
          .withDirectoryProvider(directoryProviderStub);
        // act
        const act = () => context.run();
        // assert
        await expectThrowsAsync(act, expectedError);
      });
      it('throws if directory contents cannot be listed', async () => {
        // arrange
        const expectedError = 'Failed to read directory contents';
        const fileSystemStub = new FileSystemOperationsStub();
        fileSystemStub.listDirectoryContents = () => Promise.reject(new Error(expectedError));
        const context = new TestContext()
          .withFileSystem(fileSystemStub);
        // act
        const act = () => context.run();
        // assert
        await expectThrowsAsync(act, expectedError);
      });
      it('throws if all items cannot be deleted', async () => {
        // arrange
        const itemsWithErrors: Map<string, Error> = new Map([
          ['item-1', new Error('Access Denied: item-1')],
          ['item-2', new Error('Disk I/O Error: item-2')],
        ]);
        const expectedErrorParts = [
          'Failed to delete some items',
          ...[...itemsWithErrors.values()].map((item: Error) => item.message),
        ];
        const loggerStub = new LoggerStub();
        const fileSystemStub = new FileSystemOperationsStub();
        fileSystemStub.listDirectoryContents = async () => {
          await FileSystemOperationsStub.prototype
            .listDirectoryContents.call(fileSystemStub); // register call history
          return [...itemsWithErrors.keys()];
        };
        fileSystemStub.deletePath = (path) => {
          const name = [...itemsWithErrors.keys()]
            .find((fileName) => path.endsWith(fileName));
          if (!name) {
            return Promise.resolve();
          }
          const error = itemsWithErrors.get(name)!;
          return Promise.reject(error);
        };
        const context = new TestContext()
          .withFileSystem(fileSystemStub)
          .withLogger(loggerStub);
        // act
        const act = () => context.run();
        // assert
        const error = await collectExceptionAsync(act);
        expectExists(error, formatAssertionMessage([
          `FileSystem calls: ${JSON.stringify(fileSystemStub.callHistory)}`,
          `Log calls: ${JSON.stringify(loggerStub.callHistory)}`,
        ]));
        const errorMessage = error.message;
        const notExistingErrorMessageParts = expectedErrorParts.filter(
          (e) => !errorMessage.includes(e),
        );
        expect(notExistingErrorMessageParts).to.have.lengthOf(0, formatAssertionMessage([
          'Actual error message:',
          indentText(errorMessage),
          'Expected parts:',
          indentText(expectedErrorParts.map((part) => `- ${part}`).join('\n')),
        ]));
      });
      it('throws if some items cannot be deleted', async () => {
        // arrange
        const itemsWithErrors: Map<string, Error> = new Map([
          ['item-1', new Error('Access Denied: item-1')],
          ['item-2', new Error('Disk I/O Error: item-2')],
        ]);
        const expectedErrorParts = [
          'Failed to delete some items',
          ...[...itemsWithErrors.values()].map((item: Error) => item.message),
        ];
        const itemsWithSuccess = ['successful-item-1', 'successful-item-2'];
        const allItems = [
          itemsWithSuccess[0],
          ...[...itemsWithErrors.keys()],
          itemsWithSuccess[1],
        ];
        const fileSystemStub = new FileSystemOperationsStub();
        const loggerStub = new LoggerStub();
        fileSystemStub.listDirectoryContents = async () => {
          await FileSystemOperationsStub.prototype
            .listDirectoryContents.call(fileSystemStub); // register call history
          return allItems;
        };
        fileSystemStub.deletePath = async (path) => {
          await FileSystemOperationsStub.prototype
            .deletePath.call(fileSystemStub, path); // register call history
          const name = [...itemsWithErrors.keys()].find((n) => path.endsWith(n));
          if (!name) {
            return;
          }
          const error = itemsWithErrors.get(name)!;
          throw error;
        };
        const context = new TestContext()
          .withFileSystem(fileSystemStub)
          .withLogger(loggerStub);
        // act
        const act = () => context.run();
        // assert
        const error = await collectExceptionAsync(act);
        expectExists(error, formatAssertionMessage([
          `Calls: ${JSON.stringify(fileSystemStub.callHistory)}`,
          `Logs: ${JSON.stringify(loggerStub.callHistory)}`,
        ]));
        const errorMessage = error.message;
        const notExistingErrorMessageParts = expectedErrorParts.filter(
          (e) => !error.message.includes(e),
        );
        expect(notExistingErrorMessageParts)
          .to.have.lengthOf(0, formatAssertionMessage([
            'Actual error message:',
            indentText(errorMessage),
            'Expected parts:',
            indentText(expectedErrorParts.map((part) => `- ${part}`).join('\n')),
          ]));
        expect(itemsWithSuccess.some((item) => errorMessage.includes(item)))
          .to.equal(false, formatAssertionMessage([
            'Actual error message:',
            indentText(errorMessage),
            'Unexpected parts:',
            indentText(itemsWithSuccess.map((part) => `- ${part}`).join('\n')),
          ]));
      });
    });
  });
});

class TestContext {
  private logger: Logger = new LoggerStub();

  private directoryProvider: ApplicationDirectoryProvider = new ApplicationDirectoryProviderStub();

  private fileSystem: FileSystemOperations = new FileSystemOperationsStub();

  public withDirectoryProvider(directoryProvider: ApplicationDirectoryProvider): this {
    this.directoryProvider = directoryProvider;
    return this;
  }

  public withFileSystem(fileSystem: FileSystemOperations): this {
    this.fileSystem = fileSystem;
    return this;
  }

  public withLogger(logger: Logger): this {
    this.logger = logger;
    return this;
  }

  public run(): ReturnType<typeof clearUpdateInstallationFiles> {
    return clearUpdateInstallationFiles({
      logger: this.logger,
      directoryProvider: this.directoryProvider,
      fileSystem: this.fileSystem,
    });
  }
}
