import { Dialog, FileType, SaveFileOutcome } from '@/presentation/common/Dialog';
import { FileSaverDialog } from './FileSaverDialog';
import { BrowserSaveFileDialog } from './BrowserSaveFileDialog';

export class BrowserDialog implements Dialog {
  constructor(
    private readonly window: WindowDialogAccessor = globalThis.window,
    private readonly saveFileDialog: BrowserSaveFileDialog = new FileSaverDialog(),
  ) {

  }

  public showError(title: string, message: string): void {
    this.window.alert(`❌ ${title}\n\n${message}`);
  }

  public saveFile(
    fileContents: string,
    defaultFilename: string,
    type: FileType,
  ): Promise<SaveFileOutcome> {
    return Promise.resolve(
      this.saveFileDialog.saveFile(fileContents, defaultFilename, type),
    );
  }
}

export interface WindowDialogAccessor {
  readonly alert: typeof window.alert;
}
