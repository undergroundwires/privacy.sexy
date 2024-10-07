import { describe, it, expect } from 'vitest';
import { ScriptFileCreationOrchestrator } from '@/infrastructure/CodeRunner/Creation/ScriptFileCreationOrchestrator';
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';
import { FileSystemOperationsStub } from '@tests/unit/shared/Stubs/FileSystemOperationsStub';
import type { Logger } from '@/application/Common/Log/Logger';
import { LoggerStub } from '@tests/unit/shared/Stubs/LoggerStub';
import { ApplicationDirectoryProviderStub } from '@tests/unit/shared/Stubs/ApplicationDirectoryProviderStub';
import type { FilenameGenerator } from '@/infrastructure/CodeRunner/Creation/Filename/FilenameGenerator';
import { FilenameGeneratorStub } from '@tests/unit/shared/Stubs/FilenameGeneratorStub';
import type { ScriptFilenameParts } from '@/infrastructure/CodeRunner/Creation/ScriptFileCreator';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import { expectTrue } from '@tests/shared/Assertions/ExpectTrue';
import type { CodeRunErrorType } from '@/application/CodeRunner/CodeRunner';
import { FileReadbackVerificationErrors, FileWriteOperationErrors, type ReadbackFileWriter } from '@/infrastructure/FileSystem/ReadbackFileWriter/ReadbackFileWriter';
import { ReadbackFileWriterStub } from '@tests/unit/shared/Stubs/ReadbackFileWriterStub';
import type { ApplicationDirectoryProvider, DirectoryCreationErrorType } from '@/infrastructure/FileSystem/Directory/ApplicationDirectoryProvider';
import type { FileSystemOperations } from '@/infrastructure/FileSystem/FileSystemOperations';

describe('ScriptFileCreationOrchestrator', () => {
  describe('createScriptFile', () => {
    describe('path generation', () => {
      it('correctly generates directory path', async () => {
        // arrange
        const pathSegmentSeparator = '/PATH-SEGMENT-SEPARATOR/';
        const expectedScriptDirectory = '/expected-script-directory';
        const fileSystemStub = new FileSystemOperationsStub()
          .withDefaultSeparator(pathSegmentSeparator);
        const context = new ScriptFileCreatorTestSetup()
          .withFileSystem(fileSystemStub)
          .withDirectoryProvider(
            new ApplicationDirectoryProviderStub().withDirectoryPath(
              'script-runs',
              expectedScriptDirectory,
            ),
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
        const fileSystemStub = new FileSystemOperationsStub()
          .withDefaultSeparator(pathSegmentSeparator);
        const expectedFilename = 'expected-script-file-name';
        const context = new ScriptFileCreatorTestSetup()
          .withFilenameGenerator(new FilenameGeneratorStub().withFilename(expectedFilename))
          .withFileSystem(fileSystemStub);

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
        const fileSystemStub = new FileSystemOperationsStub()
          .withJoinResult(expectedPath, directoryPath, filename);
        const context = new ScriptFileCreatorTestSetup()
          .withFilenameGenerator(new FilenameGeneratorStub().withFilename(filename))
          .withDirectoryProvider(new ApplicationDirectoryProviderStub()
            .withDirectoryPath('script-runs', directoryPath))
          .withFileSystem(fileSystemStub);

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
            const fileSystemStub = new FileSystemOperationsStub();
            fileSystemStub.combinePaths = () => {
              throw new Error(errorMessage);
            };
            return setup.withFileSystem(fileSystemStub);
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
        ...(() => {
          const directoryErrorScenarios: Record<DirectoryCreationErrorType, {
            readonly directoryErrorMessage: string;
          }> = {
            DirectoryWriteError: {
              directoryErrorMessage: 'Injected error when writing to directory',
            },
            PathConstructionError: {
              directoryErrorMessage: 'Injected error when constructing path',
            },
            UserDataFolderRetrievalError: {
              directoryErrorMessage: 'Injected error when locating user data folder',
            },
          };
          return Object.entries(directoryErrorScenarios).map(([
            directoryErrorType, { directoryErrorMessage },
          ]): FileCreationFailureTestScenario => ({
            description: `script directory creation failure: ${directoryErrorType}`,
            expectedErrorType: 'DirectoryCreationError',
            expectedErrorMessage: `[${directoryErrorType}] ${directoryErrorMessage}`,
            expectLogs: false,
            buildFaultyContext: (setup) => {
              const directoryProvider = new ApplicationDirectoryProviderStub();
              directoryProvider.provideDirectory = () => Promise.resolve({
                success: false,
                error: {
                  type: directoryErrorType as DirectoryCreationErrorType,
                  message: directoryErrorMessage,
                },
              });
              return setup.withDirectoryProvider(directoryProvider);
            },
          }));
        })(),
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
  private fileSystem: FileSystemOperations = new FileSystemOperationsStub();

  private filenameGenerator: FilenameGenerator = new FilenameGeneratorStub();

  private directoryProvider: ApplicationDirectoryProvider = new ApplicationDirectoryProviderStub();

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

  public withDirectoryProvider(directoryProvider: ApplicationDirectoryProvider): this {
    this.directoryProvider = directoryProvider;
    return this;
  }

  public withFilenameGenerator(generator: FilenameGenerator): this {
    this.filenameGenerator = generator;
    return this;
  }

  public withFileSystem(fileSystem: FileSystemOperations): this {
    this.fileSystem = fileSystem;
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
      this.fileSystem,
      this.filenameGenerator,
      this.directoryProvider,
      this.fileWriter,
      this.logger,
    );
    return creator.createScriptFile(this.fileContents, this.filenameParts);
  }
}
