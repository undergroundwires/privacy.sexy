/**
 * It defines the contract for file writing operations with an added layer of
 * verification. This approach is useful in environments where file write operations
 * might be silently intercepted or manipulated by external factors, such as antivirus software.
 *
 * This additional verification provides a more reliable and transparent file writing
 * process, enhancing the application's resilience against external disruptions and
 * improving the overall user experience. It enables the application to notify users
 * of potential issues, such as antivirus interventions, and offer guidance on how to
 * resolve them.
 */
export interface ReadbackFileWriter {
  writeAndVerifyFile(filePath: string, fileContents: string): Promise<FileWriteOutcome>;
}

export type FileWriteOutcome = SuccessfulFileWrite | FailedFileWrite;

export type FileWriteErrorType =
  | UnionOfConstArray<typeof FileWriteOperationErrors>
  | UnionOfConstArray<typeof FileReadbackVerificationErrors>;

export const FileWriteOperationErrors = [
  'WriteOperationFailed',
] as const;

export const FileReadbackVerificationErrors = [
  'FileExistenceVerificationFailed',
  'ContentVerificationFailed',

  /*
    This error indicates a failure in verifying the contents of a written file.
    This error often occurs when antivirus software falsely identifies a script as harmful and
    either alters or removes it during the readback process. This verification step is crucial
    for detecting and handling such antivirus interventions.
  */
  'ReadVerificationFailed',
] as const;

interface FileWriteStatus {
  readonly success: boolean;
  readonly error?: FileWriteError;
}

export interface SuccessfulFileWrite extends FileWriteStatus {
  readonly success: true;
  readonly error?: undefined;
}

export interface FailedFileWrite extends FileWriteStatus {
  readonly success: false;
  readonly error: FileWriteError;
}

export interface FileWriteError {
  readonly type: FileWriteErrorType;
  readonly message: string;
}

type UnionOfConstArray<T extends ReadonlyArray<unknown>> = T[number];
