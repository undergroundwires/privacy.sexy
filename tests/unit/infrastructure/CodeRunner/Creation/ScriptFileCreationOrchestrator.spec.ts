import { describe, it, expect } from 'vitest';
import { ScriptFileCreationOrchestrator } from '@/infrastructure/CodeRunner/Creation/ScriptFileCreationOrchestrator';
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';
import { FileSystemOpsStub } from '@tests/unit/shared/Stubs/FileSystemOpsStub';
import { Logger } from '@/application/Common/Log/Logger';
import { LoggerStub } from '@tests/unit/shared/Stubs/LoggerStub';
import { ScriptDirectoryProvider } from '@/infrastructure/CodeRunner/Creation/Directory/ScriptDirectoryProvider';
import { ScriptDirectoryProviderStub } from '@tests/unit/shared/Stubs/ScriptDirectoryProviderStub';
import { FilenameGenerator } from '@/infrastructure/CodeRunner/Creation/Filename/FilenameGenerator';
import { FilenameGeneratorStub } from '@tests/unit/shared/Stubs/FilenameGeneratorStub';
import { SystemOperationsStub } from '@tests/unit/shared/Stubs/SystemOperationsStub';
import { SystemOperations } from '@/infrastructure/CodeRunner/System/SystemOperations';
import { LocationOpsStub } from '@tests/unit/shared/Stubs/LocationOpsStub';

describe('ScriptFileCreationOrchestrator', () => {
  describe('createScriptFile', () => {
    describe('path generation', () => {
      it('generates correct directory path', async () => {
        // arrange
        const pathSegmentSeparator = '/PATH-SEGMENT-SEPARATOR/';
        const expectedScriptDirectory = '/expected-script-directory';
        const filesystem = new FileSystemOpsStub();
        const context = new ScriptFileCreationOrchestratorTestSetup()
          .withSystemOperations(new SystemOperationsStub()
            .withLocation(
              new LocationOpsStub().withDefaultSeparator(pathSegmentSeparator),
            )
            .withFileSystem(filesystem))
          .withDirectoryProvider(
            new ScriptDirectoryProviderStub().withDirectoryPath(expectedScriptDirectory),
          );

        // act
        const actualFilePath = await context.createScriptFile();

        // assert
        const actualDirectory = actualFilePath
          .split(pathSegmentSeparator)
          .slice(0, -1)
          .join(pathSegmentSeparator);
        expect(actualDirectory).to.equal(expectedScriptDirectory, formatAssertionMessage([
          `Actual file path: ${actualFilePath}`,
        ]));
      });
      it('generates correct file name', async () => {
        // arrange
        const pathSegmentSeparator = '/PATH-SEGMENT-SEPARATOR/';
        const filesystem = new FileSystemOpsStub();
        const expectedFilename = 'expected-script-file-name';
        const context = new ScriptFileCreationOrchestratorTestSetup()
          .withFilenameGenerator(new FilenameGeneratorStub().withFilename(expectedFilename))
          .withSystemOperations(new SystemOperationsStub()
            .withFileSystem(filesystem)
            .withLocation(new LocationOpsStub().withDefaultSeparator(pathSegmentSeparator)));

        // act
        const actualFilePath = await context.createScriptFile();

        // assert
        const actualFileName = actualFilePath
          .split(pathSegmentSeparator)
          .pop();
        expect(actualFileName).to.equal(expectedFilename);
      });
      it('generates complete file path', async () => {
        // arrange
        const expectedPath = 'expected-script-path';
        const fileName = 'file-name';
        const directoryPath = 'directory-path';
        const filesystem = new FileSystemOpsStub();
        const context = new ScriptFileCreationOrchestratorTestSetup()
          .withFilenameGenerator(new FilenameGeneratorStub().withFilename(fileName))
          .withDirectoryProvider(new ScriptDirectoryProviderStub().withDirectoryPath(directoryPath))
          .withSystemOperations(new SystemOperationsStub()
            .withFileSystem(filesystem)
            .withLocation(
              new LocationOpsStub().withJoinResult(expectedPath, directoryPath, fileName),
            ));

        // act
        const actualFilePath = await context.createScriptFile();

        // assert
        expect(actualFilePath).to.equal(expectedPath);
      });
    });
    describe('writing file to system', () => {
      it('writes file to the generated path', async () => {
        // arrange
        const filesystem = new FileSystemOpsStub();
        const context = new ScriptFileCreationOrchestratorTestSetup()
          .withSystemOperations(new SystemOperationsStub()
            .withFileSystem(filesystem));

        // act
        const expectedPath = await context.createScriptFile();

        // assert
        const calls = filesystem.callHistory.filter((call) => call.methodName === 'writeToFile');
        expect(calls.length).to.equal(1);
        const [actualFilePath] = calls[0].args;
        expect(actualFilePath).to.equal(expectedPath);
      });
      it('writes provided script content to file', async () => {
        // arrange
        const expectedCode = 'expected-code';
        const filesystem = new FileSystemOpsStub();
        const context = new ScriptFileCreationOrchestratorTestSetup()
          .withSystemOperations(new SystemOperationsStub().withFileSystem(filesystem))
          .withFileContents(expectedCode);

        // act
        await context.createScriptFile();

        // assert
        const calls = filesystem.callHistory.filter((call) => call.methodName === 'writeToFile');
        expect(calls.length).to.equal(1);
        const [, actualData] = calls[0].args;
        expect(actualData).to.equal(expectedCode);
      });
    });
  });
});

class ScriptFileCreationOrchestratorTestSetup {
  private system: SystemOperations = new SystemOperationsStub();

  private filenameGenerator: FilenameGenerator = new FilenameGeneratorStub();

  private directoryProvider: ScriptDirectoryProvider = new ScriptDirectoryProviderStub();

  private logger: Logger = new LoggerStub();

  private fileContents = `[${ScriptFileCreationOrchestratorTestSetup.name}] script file contents`;

  public withFileContents(fileContents: string): this {
    this.fileContents = fileContents;
    return this;
  }

  public withDirectoryProvider(directoryProvider: ScriptDirectoryProvider): this {
    this.directoryProvider = directoryProvider;
    return this;
  }

  public withFilenameGenerator(generator: FilenameGenerator): this {
    this.filenameGenerator = generator;
    return this;
  }

  public withSystemOperations(system: SystemOperations): this {
    this.system = system;
    return this;
  }

  public createScriptFile(): ReturnType<ScriptFileCreationOrchestrator['createScriptFile']> {
    const creator = new ScriptFileCreationOrchestrator(
      this.system,
      this.filenameGenerator,
      this.directoryProvider,
      this.logger,
    );
    return creator.createScriptFile(this.fileContents);
  }
}
