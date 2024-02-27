import type { FileType, SaveFileOutcome } from '@/presentation/common/Dialog';

export interface BrowserSaveFileDialog {
  saveFile(
    fileContents: string,
    defaultFilename: string,
    fileType: FileType,
  ): SaveFileOutcome;
}
