export interface CodeRunner {
  runCode(
    code: string,
    fileExtension: string,
  ): Promise<CodeRunOutcome>;
}

export type CodeRunOutcome = SuccessfulCodeRun | FailedCodeRun;

export type CodeRunErrorType =
  | 'FileWriteError'
  | 'FileReadbackVerificationError'
  | 'FilePathGenerationError'
  | 'UnsupportedPlatform'
  | 'DirectoryCreationError'
  | 'FilePermissionChangeError'
  | 'FileExecutionError'
  | 'ExternalProcessTermination';

interface CodeRunStatus {
  readonly success: boolean;
  readonly error?: CodeRunError;
}

interface SuccessfulCodeRun extends CodeRunStatus {
  readonly success: true;
  readonly error?: undefined;
}

export interface FailedCodeRun extends CodeRunStatus {
  readonly success: false;
  readonly error: CodeRunError;
}

export interface CodeRunError {
  readonly type: CodeRunErrorType;
  readonly message: string;
}
