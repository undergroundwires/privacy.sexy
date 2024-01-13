import { Dialog, FileType } from '@/presentation/common/Dialog';
import { NodeElectronSaveFileDialog } from './NodeElectronSaveFileDialog';
import { ElectronSaveFileDialog } from './ElectronSaveFileDialog';

export class ElectronDialog implements Dialog {
  constructor(
    private readonly fileSaveDialog: ElectronSaveFileDialog = new NodeElectronSaveFileDialog(),
  ) { }

  public async saveFile(
    fileContents: string,
    fileName: string,
    type: FileType,
  ): Promise<void> {
    await this.fileSaveDialog.saveFile(fileContents, fileName, type);
  }
}
