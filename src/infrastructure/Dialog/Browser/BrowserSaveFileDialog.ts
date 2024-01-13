import { FileType } from '@/presentation/common/Dialog';

export interface BrowserSaveFileDialog {
  saveFile(
    fileContents: string,
    fileName: string,
    fileType: FileType,
  ): void;
}
