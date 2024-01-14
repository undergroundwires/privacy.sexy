import { FileType, SaveFileOutcome } from '@/presentation/common/Dialog';

export interface ElectronSaveFileDialog {
  saveFile(
    fileContents: string,
    defaultFilename: string,
    type: FileType,
  ): Promise<SaveFileOutcome>;
}
