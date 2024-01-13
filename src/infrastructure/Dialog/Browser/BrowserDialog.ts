import { Dialog, FileType } from '@/presentation/common/Dialog';
import { FileSaverDialog } from './FileSaverDialog';
import { BrowserSaveFileDialog } from './BrowserSaveFileDialog';

export class BrowserDialog implements Dialog {
  constructor(private readonly saveFileDialog: BrowserSaveFileDialog = new FileSaverDialog()) {

  }

  public saveFile(
    fileContents: string,
    fileName: string,
    type: FileType,
  ): Promise<void> {
    return Promise.resolve(
      this.saveFileDialog.saveFile(fileContents, fileName, type),
    );
  }
}
