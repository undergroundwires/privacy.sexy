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
import { expectThrowsAsync } from '@tests/shared/Assertions/ExpectThrowsAsync';

describe('PersistentDirectoryProvider', () => {
  describe('createDirectory', () => {
    describe('path generation', () => {
      it('uses user directory as base', async () => {
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
        const actualDirectoryResult = await context.createDirectory();

        // assert
        const actualBaseDirectory = actualDirectoryResult.split(pathSegmentSeparator)[0];
        expect(actualBaseDirectory).to.equal(expectedBaseDirectory);
        const calls = locationOps.callHistory.filter((call) => call.methodName === 'combinePaths');
        expect(calls.length).to.equal(1);
        const [combinedBaseDirectory] = calls[0].args;
        expect(combinedBaseDirectory).to.equal(expectedBaseDirectory);
      });
      it('appends execution subdirectory', async () => {
        // arrange
        const expectedSubdirectory = ExecutionSubdirectory;
        const pathSegmentSeparator = '/STUB-SEGMENT-SEPARATOR/';
        const locationOps = new LocationOpsStub().withDefaultSeparator(pathSegmentSeparator);
        const context = new PersistentDirectoryProviderTestSetup()
          .withSystem(new SystemOperationsStub()
            .withLocation(locationOps));

        // act
        const actualDirectoryResult = await context.createDirectory();

        // assert
        const actualSubdirectory = actualDirectoryResult
          .split(pathSegmentSeparator)
          .pop();
        expect(actualSubdirectory).to.equal(expectedSubdirectory);
        const calls = locationOps.callHistory.filter((call) => call.methodName === 'combinePaths');
        expect(calls.length).to.equal(1);
        const [,combinedSubdirectory] = calls[0].args;
        expect(combinedSubdirectory).to.equal(expectedSubdirectory);
      });
      it('correctly forms the full path', async () => {
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
        const actualDirectory = await context.createDirectory();

        // assert
        expect(actualDirectory).to.equal(expectedDirectory);
      });
    });
    describe('directory creation', () => {
      it('creates directory recursively', async () => {
        // arrange
        const expectedIsRecursive = true;
        const filesystem = new FileSystemOpsStub();
        const context = new PersistentDirectoryProviderTestSetup()
          .withSystem(new SystemOperationsStub().withFileSystem(filesystem));

        // act
        const expectedDir = await context.createDirectory();

        // assert
        const calls = filesystem.callHistory.filter((call) => call.methodName === 'createDirectory');
        expect(calls.length).to.equal(1);
        const [actualPath, actualIsRecursive] = calls[0].args;
        expect(actualPath).to.equal(expectedDir);
        expect(actualIsRecursive).to.equal(expectedIsRecursive);
      });
      it('logs error when creation fails', async () => {
        // arrange
        const logger = new LoggerStub();
        const filesystem = new FileSystemOpsStub();
        filesystem.createDirectory = () => { throw new Error(); };
        const context = new PersistentDirectoryProviderTestSetup()
          .withLogger(logger)
          .withSystem(new SystemOperationsStub().withFileSystem(filesystem));

        // act
        try {
          await context.createDirectory();
        } catch {
          // swallow
        }

        // assert
        const errorCall = logger.callHistory.find((c) => c.methodName === 'error');
        expectExists(errorCall);
      });
      it('throws error on creation failure', async () => {
        // arrange
        const expectedError = 'expected file system error';
        const filesystem = new FileSystemOpsStub();
        filesystem.createDirectory = () => { throw new Error(expectedError); };
        const context = new PersistentDirectoryProviderTestSetup()
          .withSystem(new SystemOperationsStub().withFileSystem(filesystem));

        // act
        const act = () => context.createDirectory();

        // assert
        await expectThrowsAsync(act, expectedError);
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

  public createDirectory(): ReturnType<PersistentDirectoryProvider['provideScriptDirectory']> {
    const provider = new PersistentDirectoryProvider(this.system, this.logger);
    return provider.provideScriptDirectory();
  }
}
