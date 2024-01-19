import { dialog } from 'electron/main';
import { Dialog, FileType, SaveFileOutcome } from '@/presentation/common/Dialog';
import { NodeElectronSaveFileDialog } from './NodeElectronSaveFileDialog';
import { ElectronSaveFileDialog } from './ElectronSaveFileDialog';

export class ElectronDialog implements Dialog {
  constructor(
    private readonly saveFileDialog: ElectronSaveFileDialog = new NodeElectronSaveFileDialog(),
    private readonly electron: ElectronDialogAccessor = {
      showErrorBox: dialog.showErrorBox.bind(dialog),
    },
  ) { }

  public saveFile(
    fileContents: string,
    defaultFilename: string,
    type: FileType,
  ): Promise<SaveFileOutcome> {
    return this.saveFileDialog.saveFile(fileContents, defaultFilename, type);
  }

  public showError(title: string, message: string): void {
    this.electron.showErrorBox(title, message);
  }
}

export interface ElectronDialogAccessor {
  readonly showErrorBox: typeof dialog.showErrorBox;
}
