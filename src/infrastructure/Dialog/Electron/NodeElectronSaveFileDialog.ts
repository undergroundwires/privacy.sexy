import { join } from 'node:path';
import { writeFile } from 'node:fs/promises';
import { app, dialog } from 'electron/main';
import { Logger } from '@/application/Common/Log/Logger';
import { ElectronLogger } from '@/infrastructure/Log/ElectronLogger';
import { FileType } from '@/presentation/common/Dialog';
import { ElectronSaveFileDialog } from './ElectronSaveFileDialog';

export interface ElectronFileDialogOperations {
  getUserDownloadsPath(): string;
  showSaveDialog(options: Electron.SaveDialogOptions): Promise<Electron.SaveDialogReturnValue>;
}

export interface NodeFileOperations {
  readonly join: typeof join;
  writeFile(file: string, data: string): Promise<void>;
}

export class NodeElectronSaveFileDialog implements ElectronSaveFileDialog {
  constructor(
    private readonly logger: Logger = ElectronLogger,
    private readonly electron: ElectronFileDialogOperations = {
      getUserDownloadsPath: () => app.getPath('downloads'),
      showSaveDialog: dialog.showSaveDialog.bind(dialog),
    },
    private readonly node: NodeFileOperations = {
      join,
      writeFile,
    },
  ) { }

  public async saveFile(
    fileContents: string,
    fileName: string,
    type: FileType,
  ): Promise<void> {
    const userSelectedFilePath = await this.showSaveFileDialog(fileName, type);
    if (!userSelectedFilePath) {
      this.logger.info(`File save cancelled by user: ${fileName}`);
      return;
    }
    await this.writeFile(userSelectedFilePath, fileContents);
  }

  private async writeFile(filePath: string, fileContents: string): Promise<void> {
    try {
      this.logger.info(`Saving file: ${filePath}`);
      await this.node.writeFile(filePath, fileContents);
      this.logger.info(`File saved: ${filePath}`);
    } catch (error) {
      this.logger.error(`Error saving file: ${error.message}`);
    }
  }

  private async showSaveFileDialog(fileName: string, type: FileType): Promise<string | undefined> {
    const downloadsFolder = this.electron.getUserDownloadsPath();
    const defaultFilePath = this.node.join(downloadsFolder, fileName);
    const dialogResult = await this.electron.showSaveDialog({
      title: fileName,
      defaultPath: defaultFilePath,
      filters: getDialogFileFilters(type),
      properties: [
        'createDirectory', // Enables directory creation on macOS.
        'showOverwriteConfirmation', // Shows overwrite confirmation on Linux.
      ],
    });
    if (dialogResult.canceled) {
      return undefined;
    }
    return dialogResult.filePath;
  }
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
