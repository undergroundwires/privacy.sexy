import { join } from 'node:path';
import { app, dialog } from 'electron/main';
import { Logger } from '@/application/Common/Log/Logger';
import { ElectronLogger } from '@/infrastructure/Log/ElectronLogger';
import {
  FileType, SaveFileError, SaveFileErrorType, SaveFileOutcome,
} from '@/presentation/common/Dialog';
import { FileReadbackVerificationErrors, ReadbackFileWriter } from '@/infrastructure/ReadbackFileWriter/ReadbackFileWriter';
import { NodeReadbackFileWriter } from '@/infrastructure/ReadbackFileWriter/NodeReadbackFileWriter';
import { ElectronSaveFileDialog } from './ElectronSaveFileDialog';

export class NodeElectronSaveFileDialog implements ElectronSaveFileDialog {
  constructor(
    private readonly logger: Logger = ElectronLogger,
    private readonly electron: ElectronFileDialogOperations = {
      getUserDownloadsPath: () => app.getPath('downloads'),
      showSaveDialog: dialog.showSaveDialog.bind(dialog),
    },
    private readonly node: NodeFileOperations = { join },
    private readonly fileWriter: ReadbackFileWriter = new NodeReadbackFileWriter(),
  ) { }

  public async saveFile(
    fileContents: string,
    defaultFilename: string,
    type: FileType,
  ): Promise<SaveFileOutcome> {
    const {
      success: isPathConstructed,
      filePath: defaultFilePath,
      error: pathConstructionError,
    } = this.constructDefaultFilePath(defaultFilename);
    if (!isPathConstructed) {
      return { success: false, error: pathConstructionError };
    }
    const fileDialog = await this.showSaveFileDialog(defaultFilename, defaultFilePath, type);
    if (!fileDialog.success) {
      return {
        success: false,
        error: fileDialog.error,
      };
    }
    if (fileDialog.canceled) {
      this.logger.info(`File save cancelled by user: ${defaultFilename}`);
      return {
        success: true,
      };
    }
    const result = await this.writeFile(fileDialog.filePath, fileContents);
    return result;
  }

  private async writeFile(
    filePath: string,
    fileContents: string,
  ): Promise<SaveFileOutcome> {
    const {
      success, error,
    } = await this.fileWriter.writeAndVerifyFile(filePath, fileContents);
    if (success) {
      return { success: true };
    }
    return {
      success: false,
      error: {
        message: error.message,
        type: FileReadbackVerificationErrors.find((e) => e === error.type) ? 'FileReadbackVerificationError' : 'FileCreationError',
      },
    };
  }

  private async showSaveFileDialog(
    defaultFilename: string,
    defaultFilePath: string,
    type: FileType,
  ): Promise<SaveDialogOutcome> {
    try {
      const dialogResult = await this.electron.showSaveDialog({
        title: defaultFilename,
        defaultPath: defaultFilePath,
        filters: getDialogFileFilters(type),
        properties: [
          'createDirectory', // Enables directory creation on macOS.
          'showOverwriteConfirmation', // Shows overwrite confirmation on Linux.
        ],
      });
      if (dialogResult.canceled) {
        return { success: true, canceled: true };
      }
      if (!dialogResult.filePath) {
        return {
          success: false,
          error: { type: 'DialogDisplayError', message: 'Unexpected Error: File path is undefined after save dialog completion.' },
        };
      }
      return { success: true, filePath: dialogResult.filePath };
    } catch (error) {
      return {
        success: false,
        error: this.handleException(error, 'DialogDisplayError'),
      };
    }
  }

  private constructDefaultFilePath(defaultFilename: string): DefaultFilePathConstructionOutcome {
    try {
      const downloadsFolder = this.electron.getUserDownloadsPath();
      const defaultFilePath = this.node.join(downloadsFolder, defaultFilename);
      return {
        success: true,
        filePath: defaultFilePath,
      };
    } catch (err) {
      return {
        success: false,
        error: this.handleException(err, 'DialogDisplayError'),
      };
    }
  }

  private handleException(
    exception: Error,
    errorType: SaveFileErrorType,
  ): SaveFileError {
    const errorMessage = 'Error during saving script file.';
    this.logger.error(errorType, errorMessage, exception);
    return {
      type: errorType,
      message: `${errorMessage}: ${exception.message}`,
    };
  }
}

export interface ElectronFileDialogOperations {
  getUserDownloadsPath(): string;
  showSaveDialog(options: Electron.SaveDialogOptions): Promise<Electron.SaveDialogReturnValue>;
}

export interface NodeFileOperations {
  readonly join: typeof join;
}

function getDialogFileFilters(fileType: FileType): Electron.FileFilter[] {
  const filters = FileTypeSpecificFilters[fileType];
  return [
    ...filters,
    {
      name: 'All Files',
      extensions: ['*'],
    },
  ];
}

const FileTypeSpecificFilters: Record<FileType, Electron.FileFilter[]> = {
  [FileType.BatchFile]: [
    {
      name: 'Batch Files',
      extensions: ['bat', 'cmd'],
    },
  ],
  [FileType.ShellScript]: [
    {
      name: 'Shell Scripts',
      extensions: ['sh', 'bash', 'zsh'],
    },
  ],
};

type SaveDialogOutcome =
  | { readonly success: true; readonly filePath: string; readonly canceled?: false }
  | { readonly success: true; readonly canceled: true }
  | { readonly success: false; readonly error: SaveFileError; readonly canceled?: false };

type DefaultFilePathConstructionOutcome =
  | { readonly success: true; readonly filePath: string; readonly error?: undefined; }
  | { readonly success: false; readonly filePath?: undefined; readonly error: SaveFileError; };
