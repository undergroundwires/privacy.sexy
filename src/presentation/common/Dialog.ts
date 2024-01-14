export interface Dialog {
  showError(title: string, message: string): void;
  saveFile(fileContents: string, defaultFilename: string, type: FileType): Promise<SaveFileOutcome>;
}

export enum FileType {
  BatchFile,
  ShellScript,
}

export type SaveFileOutcome = SuccessfulSaveFile | FailedSaveFile;

interface SaveFileStatus {
  readonly success: boolean;
  readonly error?: SaveFileError;
}

interface SuccessfulSaveFile extends SaveFileStatus {
  readonly success: true;
  readonly error?: SaveFileError;
}

interface FailedSaveFile extends SaveFileStatus {
  readonly success: false;
  readonly error: SaveFileError;
}

export interface SaveFileError {
  readonly type: SaveFileErrorType;
  readonly message: string;
}

export type SaveFileErrorType =
  | 'FileCreationError'
  | 'DialogDisplayError';
