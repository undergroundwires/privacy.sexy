export interface CodeRunner {
  runCode(
    code: string,
    fileExtension: string,
  ): Promise<CodeRunOutcome>;
}

export type CodeRunErrorType =
  | 'FileWriteError'
  | 'FilePathGenerationError'
  | 'UnsupportedOperatingSystem'
  | 'FileExecutionError'
  | 'DirectoryCreationError'
  | 'UnexpectedError';

export type CodeRunOutcome = SuccessfulCodeRun | FailedCodeRun;

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
