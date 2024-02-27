import type { CodeRunError } from '@/application/CodeRunner/CodeRunner';

export interface ScriptFileExecutor {
  executeScriptFile(filePath: string): Promise<ScriptFileExecutionOutcome>;
}

export type ScriptFileExecutionOutcome = SuccessfulScriptFileExecution | FailedScriptFileExecution;

interface ScriptFileExecutionStatus {
  readonly success: boolean;
  readonly error?: CodeRunError;
}

interface SuccessfulScriptFileExecution extends ScriptFileExecutionStatus {
  readonly success: true;
  readonly error?: undefined;
}

export interface FailedScriptFileExecution extends ScriptFileExecutionStatus {
  readonly success: false;
  readonly error: CodeRunError;
}
