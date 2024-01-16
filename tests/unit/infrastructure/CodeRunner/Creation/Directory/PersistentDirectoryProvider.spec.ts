import { describe, it, expect } from 'vitest';
import { Logger } from '@/application/Common/Log/Logger';
import { ExecutionSubdirectory, PersistentDirectoryProvider } from '@/infrastructure/CodeRunner/Creation/Directory/PersistentDirectoryProvider';
import { SystemOperations } from '@/infrastructure/CodeRunner/System/SystemOperations';
import { LocationOpsStub } from '@tests/unit/shared/Stubs/LocationOpsStub';
import { LoggerStub } from '@tests/unit/shared/Stubs/LoggerStub';
import { OperatingSystemOpsStub } from '@tests/unit/shared/Stubs/OperatingSystemOpsStub';
import { SystemOperationsStub } from '@tests/unit/shared/Stubs/SystemOperationsStub';
import { FileSystemOpsStub } from '@tests/unit/shared/Stubs/FileSystemOpsStub';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import { CodeRunErrorType } from '@/application/CodeRunner/CodeRunner';
import { expectTrue } from '@tests/shared/Assertions/ExpectTrue';

describe('PersistentDirectoryProvider', () => {
  describe('createDirectory', () => {
    describe('path construction', () => {
      it('bases path on user directory', async () => {
        // arrange
        const expectedBaseDirectory = 'base-directory';
        const pathSegmentSeparator = '/STUB-SEGMENT-SEPARATOR/';
        const locationOps = new LocationOpsStub()
          .withDefaultSeparator(pathSegmentSeparator);
        const context = new PersistentDirectoryProviderTestSetup()
          .withSystem(new SystemOperationsStub()
            .withOperatingSystem(new OperatingSystemOpsStub()
              .withUserDirectoryResult(expectedBaseDirectory))
            .withLocation(locationOps));

        // act
        const { success, directoryAbsolutePath } = await context.provideScriptDirectory();

        // assert
        expectTrue(success);
        const actualBaseDirectory = directoryAbsolutePath.split(pathSegmentSeparator)[0];
        expect(actualBaseDirectory).to.equal(expectedBaseDirectory);
        const calls = locationOps.callHistory.filter((call) => call.methodName === 'combinePaths');
        expect(calls.length).to.equal(1);
        const [combinedBaseDirectory] = calls[0].args;
        expect(combinedBaseDirectory).to.equal(expectedBaseDirectory);
      });
      it('includes execution subdirectory in path', async () => {
        // arrange
        const expectedSubdirectory = ExecutionSubdirectory;
        const pathSegmentSeparator = '/STUB-SEGMENT-SEPARATOR/';
        const locationOps = new LocationOpsStub().withDefaultSeparator(pathSegmentSeparator);
        const context = new PersistentDirectoryProviderTestSetup()
          .withSystem(new SystemOperationsStub()
            .withLocation(locationOps));

        // act
        const { success, directoryAbsolutePath } = await context.provideScriptDirectory();

        // assert
        expectTrue(success);
        const actualSubdirectory = directoryAbsolutePath
          .split(pathSegmentSeparator)
          .pop();
        expect(actualSubdirectory).to.equal(expectedSubdirectory);
        const calls = locationOps.callHistory.filter((call) => call.methodName === 'combinePaths');
        expect(calls.length).to.equal(1);
        const [,combinedSubdirectory] = calls[0].args;
        expect(combinedSubdirectory).to.equal(expectedSubdirectory);
      });
      it('forms full path correctly', async () => {
        // arrange
        const pathSegmentSeparator = '/';
        const baseDirectory = 'base-directory';
        const expectedDirectory = [baseDirectory, ExecutionSubdirectory].join(pathSegmentSeparator);
        const context = new PersistentDirectoryProviderTestSetup()
          .withSystem(new SystemOperationsStub()
            .withLocation(new LocationOpsStub().withDefaultSeparator(pathSegmentSeparator))
            .withOperatingSystem(
              new OperatingSystemOpsStub().withUserDirectoryResult(baseDirectory),
            ));

        // act
        const { success, directoryAbsolutePath } = await context.provideScriptDirectory();

        // assert
        expectTrue(success);
        expect(directoryAbsolutePath).to.equal(expectedDirectory);
      });
    });
    describe('directory creation', () => {
      it('creates directory with recursion', async () => {
        // arrange
        const expectedIsRecursive = true;
        const filesystem = new FileSystemOpsStub();
        const context = new PersistentDirectoryProviderTestSetup()
          .withSystem(new SystemOperationsStub().withFileSystem(filesystem));

        // act
        const { success, directoryAbsolutePath } = await context.provideScriptDirectory();

        // assert
        expectTrue(success);
        const calls = filesystem.callHistory.filter((call) => call.methodName === 'createDirectory');
        expect(calls.length).to.equal(1);
        const [actualPath, actualIsRecursive] = calls[0].args;
        expect(actualPath).to.equal(directoryAbsolutePath);
        expect(actualIsRecursive).to.equal(expectedIsRecursive);
      });
    });
    describe('error handling', () => {
      const testScenarios: ReadonlyArray<{
        readonly description: string;
        readonly expectedErrorType: CodeRunErrorType;
        readonly expectedErrorMessage: string;
        buildFaultyContext(
          setup: PersistentDirectoryProviderTestSetup,
          errorMessage: string,
        ): PersistentDirectoryProviderTestSetup;
      }> = [
        {
          description: 'path combination failure',
          expectedErrorType: 'DirectoryCreationError',
          expectedErrorMessage: 'Error when combining paths',
          buildFaultyContext: (setup, errorMessage) => {
            const locationStub = new LocationOpsStub();
            locationStub.combinePaths = () => {
              throw new Error(errorMessage);
            };
            return setup.withSystem(new SystemOperationsStub().withLocation(locationStub));
          },
        },
        {
          description: 'user data retrieval failure',
          expectedErrorType: 'DirectoryCreationError',
          expectedErrorMessage: 'Error when locating user data directory',
          buildFaultyContext: (setup, errorMessage) => {
            const operatingSystemStub = new OperatingSystemOpsStub();
            operatingSystemStub.getUserDataDirectory = () => {
              throw new Error(errorMessage);
            };
            return setup.withSystem(
              new SystemOperationsStub().withOperatingSystem(operatingSystemStub),
            );
          },
        },
        {
          description: 'directory creation failure',
          expectedErrorType: 'DirectoryCreationError',
          expectedErrorMessage: 'Error when creating directory',
          buildFaultyContext: (setup, errorMessage) => {
            const fileSystemStub = new FileSystemOpsStub();
            fileSystemStub.createDirectory = () => {
              throw new Error(errorMessage);
            };
            return setup.withSystem(new SystemOperationsStub().withFileSystem(fileSystemStub));
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
  private system: SystemOperations = new SystemOperationsStub();

  private logger: Logger = new LoggerStub();

  public withSystem(system: SystemOperations): this {
    this.system = system;
    return this;
  }

  public withLogger(logger: Logger): this {
    this.logger = logger;
    return this;
  }

  public provideScriptDirectory(): ReturnType<PersistentDirectoryProvider['provideScriptDirectory']> {
    const provider = new PersistentDirectoryProvider(this.system, this.logger);
    return provider.provideScriptDirectory();
  }
}
