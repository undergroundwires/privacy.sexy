import { describe, it, expect } from 'vitest';
import { FileType, SaveFileErrorType } from '@/presentation/common/Dialog';
import { ElectronFileDialogOperations, NodeElectronSaveFileDialog, NodeFileOperations } from '@/infrastructure/Dialog/Electron/NodeElectronSaveFileDialog';
import { Logger } from '@/application/Common/Log/Logger';
import { LoggerStub } from '@tests/unit/shared/Stubs/LoggerStub';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import { ElectronFileDialogOperationsStub } from './ElectronFileDialogOperationsStub';
import { NodeFileOperationsStub } from './NodeFileOperationsStub';

describe('NodeElectronSaveFileDialog', () => {
  describe('dialog options', () => {
    it('correct title', async () => {
      // arrange
      const expectedFileName = 'expected-file-name';
      const electronMock = new ElectronFileDialogOperationsStub();
      const context = new SaveFileDialogTestSetup()
        .withElectron(electronMock)
        .withDefaultFilename(expectedFileName);
      // act
      await context.saveFile();
      // assert
      assertDialogOptionMatchesExpectedValue(expectedFileName, (opts) => opts.title, electronMock);
    });
    it('correct properties', async () => {
      // arrange
      const expectedProperties = [
        'createDirectory',
        'showOverwriteConfirmation',
      ];
      const electronMock = new ElectronFileDialogOperationsStub();
      const context = new SaveFileDialogTestSetup()
        .withElectron(electronMock);
      // act
      await context.saveFile();
      // assert
      assertDialogOptionMatchesExpectedValue(
        expectedProperties,
        (opts) => opts.properties,
        electronMock,
      );
    });
    it('correct default path', async () => {
      // arrange
      const pathSegmentSeparator = '_{test-separator}_';
      const expectedFileName = 'expected-file-name';
      const expectedParentDirectory = 'expected-downloads-path';
      const expectedFilePath = [
        expectedParentDirectory,
        expectedFileName,
      ].join(pathSegmentSeparator);
      const electronMock = new ElectronFileDialogOperationsStub()
        .withUserDownloadsPath(expectedParentDirectory);
      const context = new SaveFileDialogTestSetup()
        .withElectron(electronMock)
        .withDefaultFilename(expectedFileName)
        .withNode(new NodeFileOperationsStub().withPathSegmentSeparator(pathSegmentSeparator));
      // act
      await context.saveFile();
      // assert
      assertDialogOptionMatchesExpectedValue(
        expectedFilePath,
        (opts) => opts.defaultPath,
        electronMock,
      );
    });
    describe('correct file type filters', () => {
      const defaultFilter: Electron.FileFilter = {
        name: 'All Files',
        extensions: ['*'],
      };
      const testScenarios: Record<FileType, Electron.FileFilter[]> = {
        [FileType.BatchFile]: [
          defaultFilter,
          {
            name: 'Batch Files',
            extensions: ['bat', 'cmd'],
          },
        ],
        [FileType.ShellScript]: [
          defaultFilter,
          {
            name: 'Shell Scripts',
            extensions: ['sh', 'bash', 'zsh'],
          },
        ],
      };
      Object.entries(testScenarios).forEach(([fileTypeKey, expectedFilters]) => {
        const fileType = Number(fileTypeKey) as FileType;
        it(`applies correct filters for ${FileType[fileType]}`, async () => {
          // arrange
          const electronMock = new ElectronFileDialogOperationsStub();
          const context = new SaveFileDialogTestSetup()
            .withFileType(fileType)
            .withElectron(electronMock);
          // act
          await context.saveFile();
          // assert
          const sortFilters = (
            filters: Electron.FileFilter[],
          ) => filters.sort((a, b) => a.name.localeCompare(b.name));
          const expectedSortedFilters = sortFilters(expectedFilters);
          assertDialogOptionMatchesExpectedValue(
            expectedSortedFilters,
            (opts) => sortFilters(opts.filters ?? []),
            electronMock,
          );
        });
      });
    });
  });

  describe('file saving process', () => {
    describe('when dialog is confirmed', () => {
      it('writes to the selected file path', async () => {
        // arrange
        const expectedFilePath = 'expected-file-path';
        const isCancelled = false;
        const electronMock = new ElectronFileDialogOperationsStub()
          .withMimicUserCancel(isCancelled)
          .withUserSelectedFilePath(expectedFilePath);
        const nodeMock = new NodeFileOperationsStub();
        const context = new SaveFileDialogTestSetup()
          .withElectron(electronMock)
          .withNode(nodeMock);

        // act
        await context.saveFile();

        // assert
        const saveFileCalls = nodeMock.callHistory.filter((c) => c.methodName === 'writeFile');
        expect(saveFileCalls).to.have.lengthOf(1);
        const [actualFilePath] = saveFileCalls[0].args;
        expect(actualFilePath).to.equal(expectedFilePath);
      });
      it('writes the correct file contents', async () => {
        // arrange
        const expectedFileContents = 'expected-file-contents';
        const isCancelled = false;
        const electronMock = new ElectronFileDialogOperationsStub()
          .withMimicUserCancel(isCancelled);
        const nodeMock = new NodeFileOperationsStub();
        const context = new SaveFileDialogTestSetup()
          .withElectron(electronMock)
          .withFileContents(expectedFileContents)
          .withNode(nodeMock);

        // act
        await context.saveFile();

        // assert
        const saveFileCalls = nodeMock.callHistory.filter((c) => c.methodName === 'writeFile');
        expect(saveFileCalls).to.have.lengthOf(1);
        const [,actualFileContents] = saveFileCalls[0].args;
        expect(actualFileContents).to.equal(expectedFileContents);
      });
      it('returns success status', async () => {
        // arrange
        const expectedSuccessValue = true;
        const context = new SaveFileDialogTestSetup();

        // act
        const { success } = await context.saveFile();

        // assert
        expect(success).to.equal(expectedSuccessValue);
      });
    });
    describe('when dialog is canceled', async () => {
      it('does not save file', async () => {
        // arrange
        const isCancelled = true;
        const electronMock = new ElectronFileDialogOperationsStub()
          .withMimicUserCancel(isCancelled);
        const nodeMock = new NodeFileOperationsStub();
        const context = new SaveFileDialogTestSetup()
          .withElectron(electronMock)
          .withNode(nodeMock);

        // act
        await context.saveFile();

        // assert
        const saveFileCall = nodeMock.callHistory.find((c) => c.methodName === 'writeFile');
        expect(saveFileCall).to.equal(undefined);
      });
      it('logs cancelation info', async () => {
        // arrange
        const expectedLogMessagePart = 'File save cancelled';
        const logger = new LoggerStub();
        const isCancelled = true;
        const electronMock = new ElectronFileDialogOperationsStub()
          .withMimicUserCancel(isCancelled);
        const context = new SaveFileDialogTestSetup()
          .withElectron(electronMock)
          .withLogger(logger);

        // act
        await context.saveFile();

        // assert
        logger.assertLogsContainMessagePart('info', expectedLogMessagePart);
      });
      it('returns success', async () => {
        // arrange
        const expectedSuccessValue = true;
        const isCancelled = true;
        const electronMock = new ElectronFileDialogOperationsStub()
          .withMimicUserCancel(isCancelled);
        const context = new SaveFileDialogTestSetup()
          .withElectron(electronMock);

        // act
        const { success } = await context.saveFile();

        // assert
        expect(success).to.equal(expectedSuccessValue);
      });
    });
  });

  describe('error handling', () => {
    const testScenarios: ReadonlyArray<{
      readonly description: string;
      readonly expectedErrorType: SaveFileErrorType;
      readonly expectedErrorMessage: string;
      buildFaultyContext(
        setup: SaveFileDialogTestSetup,
        errorMessage: string,
      ): SaveFileDialogTestSetup;
    }> = [
      {
        description: 'file writing failure',
        expectedErrorType: 'FileCreationError',
        expectedErrorMessage: 'Error when writing file',
        buildFaultyContext: (setup, errorMessage) => {
          const electronMock = new ElectronFileDialogOperationsStub().withMimicUserCancel(false);
          const nodeMock = new NodeFileOperationsStub();
          nodeMock.writeFile = () => Promise.reject(new Error(errorMessage));
          return setup
            .withElectron(electronMock)
            .withNode(nodeMock);
        },
      },
      {
        description: 'user path retrieval failure',
        expectedErrorType: 'DialogDisplayError',
        expectedErrorMessage: 'Error when retrieving user path',
        buildFaultyContext: (setup, errorMessage) => {
          const electronMock = new ElectronFileDialogOperationsStub().withMimicUserCancel(false);
          electronMock.getUserDownloadsPath = () => {
            throw new Error(errorMessage);
          };
          return setup
            .withElectron(electronMock);
        },
      },
      {
        description: 'path combination failure',
        expectedErrorType: 'DialogDisplayError',
        expectedErrorMessage: 'Error when combining paths',
        buildFaultyContext: (setup, errorMessage) => {
          const nodeMock = new NodeFileOperationsStub();
          nodeMock.join = () => {
            throw new Error(errorMessage);
          };
          return setup
            .withNode(nodeMock);
        },
      },
      {
        description: 'dialog display failure',
        expectedErrorType: 'DialogDisplayError',
        expectedErrorMessage: 'Error when showing save dialog',
        buildFaultyContext: (setup, errorMessage) => {
          const electronMock = new ElectronFileDialogOperationsStub().withMimicUserCancel(false);
          electronMock.showSaveDialog = () => Promise.reject(new Error(errorMessage));
          return setup
            .withElectron(electronMock);
        },
      },
      {
        description: 'unexpected dialog return value failure',
        expectedErrorType: 'DialogDisplayError',
        expectedErrorMessage: 'Unexpected Error: File path is undefined after save dialog completion.',
        buildFaultyContext: (setup) => {
          const electronMock = new ElectronFileDialogOperationsStub().withMimicUserCancel(false);
          electronMock.showSaveDialog = () => Promise.resolve({
            canceled: false,
            filePath: undefined,
          });
          return setup
            .withElectron(electronMock);
        },
      },
    ];
    testScenarios.forEach(({
      description, expectedErrorType, expectedErrorMessage, buildFaultyContext,
    }) => {
      it(`handles error - ${description}`, async () => {
        // arrange
        const context = buildFaultyContext(
          new SaveFileDialogTestSetup(),
          expectedErrorMessage,
        );

        // act
        const { success, error } = await context.saveFile();

        // assert
        expect(success).to.equal(false);
        expectExists(error);
        expect(error.message).to.include(expectedErrorMessage);
        expect(error.type).to.equal(expectedErrorType);
      });
      it(`logs error: ${description}`, async () => {
        // arrange
        const loggerStub = new LoggerStub();
        const context = buildFaultyContext(
          new SaveFileDialogTestSetup()
            .withLogger(loggerStub),
          expectedErrorMessage,
        );

        // act
        await context.saveFile();

        // assert
        loggerStub.assertLogsContainMessagePart('error', expectedErrorMessage);
      });
    });
  });
});

class SaveFileDialogTestSetup {
  private fileContents = `${SaveFileDialogTestSetup.name} file contents`;

  private filename = `${SaveFileDialogTestSetup.name} filename`;

  private fileType = FileType.BatchFile;

  private logger: Logger = new LoggerStub();

  private electron: ElectronFileDialogOperations = new ElectronFileDialogOperationsStub();

  private node: NodeFileOperations = new NodeFileOperationsStub();

  public withElectron(electron: ElectronFileDialogOperations): this {
    this.electron = electron;
    return this;
  }

  public withNode(node: NodeFileOperations): this {
    this.node = node;
    return this;
  }

  public withLogger(logger: Logger): this {
    this.logger = logger;
    return this;
  }

  public withDefaultFilename(defaultFilename: string): this {
    this.filename = defaultFilename;
    return this;
  }

  public withFileContents(fileContents: string): this {
    this.fileContents = fileContents;
    return this;
  }

  public withFileType(fileType: FileType): this {
    this.fileType = fileType;
    return this;
  }

  public saveFile() {
    const dialog = new NodeElectronSaveFileDialog(this.logger, this.electron, this.node);
    return dialog.saveFile(
      this.fileContents,
      this.filename,
      this.fileType,
    );
  }
}

function assertDialogOptionMatchesExpectedValue<T>(
  expectedValue: T,
  getActualOption: (opts: Electron.SaveDialogOptions) => T | undefined,
  electronMock: ElectronFileDialogOperationsStub,
): void {
  const showDialogCalls = electronMock.callHistory.filter((c) => c.methodName === 'showSaveDialog');
  expect(showDialogCalls).to.have.lengthOf(1);
  const showDialogCall = showDialogCalls[0];
  expectExists(showDialogCall);
  const [options] = showDialogCall.args;
  expectExists(options);
  const actualValue = getActualOption(options);
  expect(actualValue).to.deep.equal(expectedValue);
}
