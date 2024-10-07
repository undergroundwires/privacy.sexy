export interface ApplicationDirectoryProvider {
  provideDirectory(type: DirectoryType): Promise<DirectoryCreationOutcome>;
}

export type DirectoryType = 'update-installation-files' | 'script-runs';

export type DirectoryCreationOutcome = SuccessfulDirectoryCreation | FailedDirectoryCreation;

export type DirectoryCreationErrorType = 'PathConstructionError' | 'DirectoryWriteError' | 'UserDataFolderRetrievalError';

export interface DirectoryCreationError {
  readonly type: DirectoryCreationErrorType;
  readonly message: string;
}

interface DirectoryCreationStatus {
  readonly success: boolean;
  readonly directoryAbsolutePath?: string;
  readonly error?: DirectoryCreationError;
}

interface SuccessfulDirectoryCreation extends DirectoryCreationStatus {
  readonly success: true;
  readonly directoryAbsolutePath: string;
}

interface FailedDirectoryCreation extends DirectoryCreationStatus {
  readonly success: false;
  readonly error: DirectoryCreationError;
}
