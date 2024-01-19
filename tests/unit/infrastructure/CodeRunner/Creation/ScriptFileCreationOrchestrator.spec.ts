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
import { ScriptFilenameParts } from '@/infrastructure/CodeRunner/Creation/ScriptFileCreator';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import { expectTrue } from '@tests/shared/Assertions/ExpectTrue';
import { CodeRunErrorType } from '@/application/CodeRunner/CodeRunner';
import { FileReadbackVerificationErrors, FileWriteOperationErrors, ReadbackFileWriter } from '@/infrastructure/ReadbackFileWriter/ReadbackFileWriter';
import { ReadbackFileWriterStub } from '@tests/unit/shared/Stubs/ReadbackFileWriterStub';

describe('ScriptFileCreationOrchestrator', () => {
  describe('createScriptFile', () => {
    describe('path generation', () => {
      it('correctly generates directory path', async () => {
        // arrange
        const pathSegmentSeparator = '/PATH-SEGMENT-SEPARATOR/';
        const expectedScriptDirectory = '/expected-script-directory';
        const filesystem = new FileSystemOpsStub();
        const context = new ScriptFileCreatorTestSetup()
          .withSystem(new SystemOperationsStub()
            .withLocation(
              new LocationOpsStub().withDefaultSeparator(pathSegmentSeparator),
            )
            .withFileSystem(filesystem))
          .withDirectoryProvider(
            new ScriptDirectoryProviderStub().withDirectoryPath(expectedScriptDirectory),
          );

        // act
        const { success, scriptFileAbsolutePath } = await context.createScriptFile();

        // assert
        expectTrue(success);
        const actualDirectory = scriptFileAbsolutePath
          .split(pathSegmentSeparator)
          .slice(0, -1)
          .join(pathSegmentSeparator);
        expect(actualDirectory).to.equal(expectedScriptDirectory, formatAssertionMessage([
          `Actual file path: ${scriptFileAbsolutePath}`,
        ]));
      });
      it('correctly generates filename', async () => {
        // arrange
        const pathSegmentSeparator = '/PATH-SEGMENT-SEPARATOR/';
        const filesystem = new FileSystemOpsStub();
        const expectedFilename = 'expected-script-file-name';
        const context = new ScriptFileCreatorTestSetup()
          .withFilenameGenerator(new FilenameGeneratorStub().withFilename(expectedFilename))
          .withSystem(new SystemOperationsStub()
            .withFileSystem(filesystem)
            .withLocation(new LocationOpsStub().withDefaultSeparator(pathSegmentSeparator)));

        // act
        const { success, scriptFileAbsolutePath } = await context.createScriptFile();

        // assert
        expectTrue(success);
        const actualFileName = scriptFileAbsolutePath
          .split(pathSegmentSeparator)
          .pop();
        expect(actualFileName).to.equal(expectedFilename);
      });
      it('uses specified parts to generate filename', async () => {
        // arrange
        const expectedParts: ScriptFilenameParts = {
          scriptName: 'expected-script-name',
          scriptFileExtension: 'expected-script-file-extension',
        };
        const filenameGeneratorStub = new FilenameGeneratorStub();
        const context = new ScriptFileCreatorTestSetup()
          .withFileNameParts(expectedParts)
          .withFilenameGenerator(filenameGeneratorStub);

        // act
        await context.createScriptFile();

        // assert
        const filenameGenerationCalls = filenameGeneratorStub.callHistory.filter((c) => c.methodName === 'generateFilename');
        expect(filenameGenerationCalls).to.have.lengthOf(1);
        const callArguments = filenameGenerationCalls[0].args;
        const [scriptNameFileParts] = callArguments;
        expectExists(scriptNameFileParts, `Call arguments: ${JSON.stringify(callArguments)}`);
        expect(scriptNameFileParts).to.equal(expectedParts);
      });
      it('correctly generates complete file path', async () => {
        // arrange
        const expectedPath = 'expected-script-path';
        const filename = 'filename';
        const directoryPath = 'directory-path';
        const filesystem = new FileSystemOpsStub();
        const context = new ScriptFileCreatorTestSetup()
          .withFilenameGenerator(new FilenameGeneratorStub().withFilename(filename))
          .withDirectoryProvider(new ScriptDirectoryProviderStub().withDirectoryPath(directoryPath))
          .withSystem(new SystemOperationsStub()
            .withFileSystem(filesystem)
            .withLocation(
              new LocationOpsStub().withJoinResult(expectedPath, directoryPath, filename),
            ));

        // act
        const { success, scriptFileAbsolutePath } = await context.createScriptFile();

        // assert
        expectTrue(success);
        expect(scriptFileAbsolutePath).to.equal(expectedPath);
      });
    });
    describe('file writing', () => {
      it('writes to generated file path', async () => {
        // arrange
        const fileWriter = new ReadbackFileWriterStub();
        const context = new ScriptFileCreatorTestSetup()
          .withFileWriter(fileWriter);

        // act
        const { success, scriptFileAbsolutePath } = await context.createScriptFile();

        // assert
        expectTrue(success);
        const calls = fileWriter.callHistory.filter((call) => call.methodName === 'writeAndVerifyFile');
        expect(calls.length).to.equal(1);
        const [actualFilePath] = calls[0].args;
        expect(actualFilePath).to.equal(scriptFileAbsolutePath);
      });
      it('writes script content to file', async () => {
        // arrange
        const expectedCode = 'expected-code';
        const fileWriter = new ReadbackFileWriterStub();
        const context = new ScriptFileCreatorTestSetup()
          .withFileWriter(fileWriter)
          .withFileContents(expectedCode);

        // act
        await context.createScriptFile();

        // assert
        const calls = fileWriter.callHistory.filter((call) => call.methodName === 'writeAndVerifyFile');
        expect(calls.length).to.equal(1);
        const [, actualData] = calls[0].args;
        expect(actualData).to.equal(expectedCode);
      });
    });
    describe('error handling', () => {
      interface FileCreationFailureTestScenario {
        readonly description: string;
        readonly expectedErrorType: CodeRunErrorType;
        readonly expectedErrorMessage: string;
        readonly expectLogs: boolean;
        buildFaultyContext(
          setup: ScriptFileCreatorTestSetup,
          errorMessage: string,
          errorType: CodeRunErrorType,
        ): ScriptFileCreatorTestSetup;
      }
      const testScenarios: readonly FileCreationFailureTestScenario[] = [
        {
          description: 'path combination failure',
          expectedErrorType: 'FilePathGenerationError',
          expectedErrorMessage: 'Error when combining paths',
          expectLogs: true,
          buildFaultyContext: (setup, errorMessage) => {
            const locationStub = new LocationOpsStub();
            locationStub.combinePaths = () => {
              throw new Error(errorMessage);
            };
            return setup.withSystem(new SystemOperationsStub().withLocation(locationStub));
          },
        },
        ...FileWriteOperationErrors.map((writeError): FileCreationFailureTestScenario => ({
          description: `file writing failure: ${writeError}`,
          expectedErrorType: 'FileWriteError',
          expectedErrorMessage: 'Error when writing to file',
          expectLogs: false,
          buildFaultyContext: (setup, errorMessage) => {
            const fileWriterStub = new ReadbackFileWriterStub();
            fileWriterStub.configureFailure(writeError, errorMessage);
            return setup.withFileWriter(fileWriterStub);
          },
        })),
        ...FileReadbackVerificationErrors.map(
          (verificationError): FileCreationFailureTestScenario => (
            {
              description: `file verification failure: ${verificationError}`,
              expectedErrorType: 'FileReadbackVerificationError',
              expectedErrorMessage: 'Error when verifying the file',
              expectLogs: false,
              buildFaultyContext: (setup, errorMessage) => {
                const fileWriterStub = new ReadbackFileWriterStub();
                fileWriterStub.configureFailure(verificationError, errorMessage);
                return setup.withFileWriter(fileWriterStub);
              },
            }),
        ),
        {
          description: 'filename generation failure',
          expectedErrorType: 'FilePathGenerationError',
          expectedErrorMessage: 'Error when writing to file',
          expectLogs: true,
          buildFaultyContext: (setup, errorMessage) => {
            const filenameGenerator = new FilenameGeneratorStub();
            filenameGenerator.generateFilename = () => {
              throw new Error(errorMessage);
            };
            return setup.withFilenameGenerator(filenameGenerator);
          },
        },
        {
          description: 'script directory provision failure',
          expectedErrorType: 'DirectoryCreationError',
          expectedErrorMessage: 'Error when providing directory',
          expectLogs: false,
          buildFaultyContext: (setup, errorMessage, errorType) => {
            const directoryProvider = new ScriptDirectoryProviderStub();
            directoryProvider.provideScriptDirectory = () => Promise.resolve({
              success: false,
              error: {
                message: errorMessage,
                type: errorType,
              },
            });
            return setup.withDirectoryProvider(directoryProvider);
          },
        },
      ];
      testScenarios.forEach(({
        description, expectedErrorType, expectedErrorMessage, buildFaultyContext, expectLogs,
      }) => {
        it(`handles error - ${description}`, async () => {
          // arrange
          const context = buildFaultyContext(
            new ScriptFileCreatorTestSetup(),
            expectedErrorMessage,
            expectedErrorType,
          );

          // act
          const { success, error } = await context.createScriptFile();

          // assert
          expect(success).to.equal(false);
          expectExists(error);
          expect(error.message).to.include(expectedErrorMessage);
          expect(error.type).to.equal(expectedErrorType);
        });
        if (expectLogs) {
          it(`logs error - ${description}`, async () => {
            // arrange
            const loggerStub = new LoggerStub();
            const context = buildFaultyContext(
              new ScriptFileCreatorTestSetup()
                .withLogger(loggerStub),
              expectedErrorMessage,
              expectedErrorType,
            );

            // act
            await context.createScriptFile();

            // assert
            loggerStub.assertLogsContainMessagePart('error', expectedErrorMessage);
          });
        }
      });
    });
  });
});

class ScriptFileCreatorTestSetup {
  private system: SystemOperations = new SystemOperationsStub();

  private filenameGenerator: FilenameGenerator = new FilenameGeneratorStub();

  private directoryProvider: ScriptDirectoryProvider = new ScriptDirectoryProviderStub();

  private logger: Logger = new LoggerStub();

  private fileWriter: ReadbackFileWriter = new ReadbackFileWriterStub();

  private fileContents = `[${ScriptFileCreatorTestSetup.name}] script file contents`;

  private filenameParts: ScriptFilenameParts = {
    scriptName: `[${ScriptFileCreatorTestSetup.name}] script name`,
    scriptFileExtension: `[${ScriptFileCreatorTestSetup.name}] file extension`,
  };

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

  public withSystem(system: SystemOperations): this {
    this.system = system;
    return this;
  }

  public withFileNameParts(filenameParts: ScriptFilenameParts): this {
    this.filenameParts = filenameParts;
    return this;
  }

  public withLogger(logger: Logger): this {
    this.logger = logger;
    return this;
  }

  public withFileWriter(fileWriter: ReadbackFileWriter): this {
    this.fileWriter = fileWriter;
    return this;
  }

  public createScriptFile(): ReturnType<ScriptFileCreationOrchestrator['createScriptFile']> {
    const creator = new ScriptFileCreationOrchestrator(
      this.system,
      this.filenameGenerator,
      this.directoryProvider,
      this.fileWriter,
      this.logger,
    );
    return creator.createScriptFile(this.fileContents, this.filenameParts);
  }
}
