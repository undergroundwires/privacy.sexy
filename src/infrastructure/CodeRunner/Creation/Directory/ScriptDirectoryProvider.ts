import { CodeRunError } from '@/application/CodeRunner/CodeRunner';

export interface ScriptDirectoryProvider {
  provideScriptDirectory(): Promise<ScriptDirectoryOutcome>;
}

export type ScriptDirectoryOutcome = SuccessfulDirectoryCreation | FailedDirectoryCreation;

interface ScriptDirectoryCreationStatus {
  readonly success: boolean;
  readonly directoryAbsolutePath?: string;
  readonly error?: CodeRunError;
}

interface SuccessfulDirectoryCreation extends ScriptDirectoryCreationStatus {
  readonly success: true;
  readonly directoryAbsolutePath: string;
}

interface FailedDirectoryCreation extends ScriptDirectoryCreationStatus {
  readonly success: false;
  readonly error: CodeRunError;
}
