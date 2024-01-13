import { FileType } from '@/presentation/common/Dialog';

export interface ElectronSaveFileDialog {
  saveFile(
    fileContents: string,
    fileName: string,
    type: FileType,
  ): Promise<void>;
}
