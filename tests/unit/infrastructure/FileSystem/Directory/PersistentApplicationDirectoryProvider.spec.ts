import { describe, it, expect } from 'vitest';
import type { Logger } from '@/application/Common/Log/Logger';
import { LoggerStub } from '@tests/unit/shared/Stubs/LoggerStub';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import { expectTrue } from '@tests/shared/Assertions/ExpectTrue';
import { FileSystemOperationsStub } from '@tests/unit/shared/Stubs/FileSystemOperationsStub';
import type { DirectoryCreationErrorType, DirectoryType } from '@/infrastructure/FileSystem/Directory/ApplicationDirectoryProvider';
import { PersistentApplicationDirectoryProvider, SubdirectoryNames } from '@/infrastructure/FileSystem/Directory/PersistentApplicationDirectoryProvider';
import type { FileSystemOperations } from '@/infrastructure/FileSystem/FileSystemOperations';

describe('PersistentApplicationDirectoryProvider', () => {
  describe('createDirectory', () => {
    describe('path construction', () => {
      it('bases path on user directory', async () => {
        // arrange
        const expectedBaseDirectory = 'base-directory';
        const pathSegmentSeparator = '/STUB-SEGMENT-SEPARATOR/';
        const fileSystemStub = new FileSystemOperationsStub()
          .withUserDirectoryResult(expectedBaseDirectory)
          .withDefaultSeparator(pathSegmentSeparator);
        const context = new PersistentDirectoryProviderTestSetup()
          .withFileSystem(fileSystemStub);

        // act
        const { success, directoryAbsolutePath } = await context.provideScriptDirectory();

        // assert
        expectTrue(success);
        const actualBaseDirectory = directoryAbsolutePath.split(pathSegmentSeparator)[0];
        expect(actualBaseDirectory).to.equal(expectedBaseDirectory);
        const calls = fileSystemStub.callHistory.filter((call) => call.methodName === 'combinePaths');
        expect(calls.length).to.equal(1);
        const [combinedBaseDirectory] = calls[0].args;
        expect(combinedBaseDirectory).to.equal(expectedBaseDirectory);
      });
      describe('includes correct execution subdirectory in path', () => {
        const testScenarios: readonly {
          readonly description: string;
          readonly givenDirectoryType: DirectoryType;
          readonly expectedSubdirectoryName: string;
        }[] = Object.entries(SubdirectoryNames).map(([type, name]) => ({
          description: `returns '${name}' for '${type}'`,
          givenDirectoryType: type as DirectoryType,
          expectedSubdirectoryName: name,
        }));
        testScenarios.forEach(({
          description, expectedSubdirectoryName, givenDirectoryType,
        }) => {
          it(description, async () => {
            // arrange
            const pathSegmentSeparator = '/STUB-SEGMENT-SEPARATOR/';
            const fileSystemStub = new FileSystemOperationsStub()
              .withDefaultSeparator(pathSegmentSeparator);
            const context = new PersistentDirectoryProviderTestSetup()
              .withFileSystem(fileSystemStub)
              .withDirectoryType(givenDirectoryType);

            // act
            const { success, directoryAbsolutePath } = await context.provideScriptDirectory();

            // assert
            expectTrue(success);
            const actualSubdirectory = directoryAbsolutePath
              .split(pathSegmentSeparator)
              .pop();
            expect(actualSubdirectory).to.equal(expectedSubdirectoryName);
            const calls = fileSystemStub.callHistory.filter((call) => call.methodName === 'combinePaths');
            expect(calls.length).to.equal(1);
            const [,combinedSubdirectory] = calls[0].args;
            expect(combinedSubdirectory).to.equal(expectedSubdirectoryName);
          });
        });
      });
      it('forms full path correctly', async () => {
        // arrange
        const directoryType: DirectoryType = 'script-runs';
        const pathSegmentSeparator = '/';
        const baseDirectory = 'base-directory';
        const expectedDirectory = [baseDirectory, SubdirectoryNames[directoryType]]
          .join(pathSegmentSeparator);
        const fileSystemStub = new FileSystemOperationsStub()
          .withDefaultSeparator(pathSegmentSeparator)
          .withUserDirectoryResult(baseDirectory);
        const context = new PersistentDirectoryProviderTestSetup()
          .withFileSystem(fileSystemStub)
          .withDirectoryType(directoryType);

        // act
        const { success, directoryAbsolutePath } = await context.provideScriptDirectory();
        expect(success).to.equal(true);
        expect(directoryAbsolutePath).to.equal(expectedDirectory);
      });
    });
    describe('directory creation', () => {
      it('creates directory with recursion', async () => {
        // arrange
        const expectedIsRecursive = true;
        const fileSystemStub = new FileSystemOperationsStub();
        const context = new PersistentDirectoryProviderTestSetup()
          .withFileSystem(fileSystemStub);

        // act
        const { success, directoryAbsolutePath } = await context.provideScriptDirectory();

        // assert
        expectTrue(success);
        const calls = fileSystemStub.callHistory.filter((call) => call.methodName === 'createDirectory');
        expect(calls.length).to.equal(1);
        const [actualPath, actualIsRecursive] = calls[0].args;
        expect(actualPath).to.equal(directoryAbsolutePath);
        expect(actualIsRecursive).to.equal(expectedIsRecursive);
      });
    });
    describe('error handling', () => {
      const testScenarios: ReadonlyArray<{
        readonly description: string;
        readonly expectedErrorType: DirectoryCreationErrorType;
        readonly expectedErrorMessage: string;
        buildFaultyContext(
          setup: PersistentDirectoryProviderTestSetup,
          errorMessage: string,
        ): PersistentDirectoryProviderTestSetup;
      }> = [
        {
          description: 'path combination failure',
          expectedErrorType: 'PathConstructionError',
          expectedErrorMessage: 'Error when combining paths',
          buildFaultyContext: (setup, errorMessage) => {
            const fileSystemStub = new FileSystemOperationsStub();
            fileSystemStub.combinePaths = () => {
              throw new Error(errorMessage);
            };
            return setup.withFileSystem(fileSystemStub);
          },
        },
        {
          description: 'user data retrieval failure',
          expectedErrorType: 'UserDataFolderRetrievalError',
          expectedErrorMessage: 'Error when locating user data directory',
          buildFaultyContext: (setup, errorMessage) => {
            const fileSystemStub = new FileSystemOperationsStub();
            fileSystemStub.getUserDataDirectory = () => {
              throw new Error(errorMessage);
            };
            return setup.withFileSystem(fileSystemStub);
          },
        },
        {
          description: 'directory creation failure',
          expectedErrorType: 'DirectoryWriteError',
          expectedErrorMessage: 'Error when creating directory',
          buildFaultyContext: (setup, errorMessage) => {
            const fileSystemStub = new FileSystemOperationsStub();
            fileSystemStub.createDirectory = () => {
              throw new Error(errorMessage);
            };
            return setup.withFileSystem(fileSystemStub);
          },
        },
      ];
      testScenarios.forEach(({
        description, expectedErrorType, expectedErrorMessage, buildFaultyContext,
      }) => {
        it(`handles error - ${description}`, async () => {
          // arrange
          const context = buildFaultyContext(
            new PersistentDirectoryProviderTestSetup(),
            expectedErrorMessage,
          );

          // act
          const { success, error } = await context.provideScriptDirectory();

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
            new PersistentDirectoryProviderTestSetup()
              .withLogger(loggerStub),
            expectedErrorMessage,
          );

          // act
          await context.provideScriptDirectory();

          // assert
          loggerStub.assertLogsContainMessagePart('error', expectedErrorMessage);
        });
      });
    });
  });
});

class PersistentDirectoryProviderTestSetup {
  private fileSystem: FileSystemOperations = new FileSystemOperationsStub();

  private logger: Logger = new LoggerStub();

  private directoryType: DirectoryType = 'script-runs';

  public withFileSystem(fileSystem: FileSystemOperations): this {
    this.fileSystem = fileSystem;
    return this;
  }

  public withLogger(logger: Logger): this {
    this.logger = logger;
    return this;
  }

  public withDirectoryType(directoryType: DirectoryType): this {
    this.directoryType = directoryType;
    return this;
  }

  public provideScriptDirectory(): ReturnType<PersistentApplicationDirectoryProvider['provideDirectory']> {
    const provider = new PersistentApplicationDirectoryProvider(this.fileSystem, this.logger);
    return provider.provideDirectory(this.directoryType);
  }
}
