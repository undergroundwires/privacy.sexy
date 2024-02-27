import type { CodeRunError } from '@/application/CodeRunner/CodeRunner';

export interface ScriptFileCreator {
  createScriptFile(
    contents: string,
    scriptFilenameParts: ScriptFilenameParts,
  ): Promise<ScriptFileCreationOutcome>;
}

export interface ScriptFilenameParts {
  readonly scriptName: string;
  readonly scriptFileExtension: string | undefined;
}

export type ScriptFileCreationOutcome = SuccessfulScriptCreation | FailedScriptCreation;

interface ScriptFileCreationStatus {
  readonly success: boolean;
  readonly error?: CodeRunError;
  readonly scriptFileAbsolutePath?: string;
}

interface SuccessfulScriptCreation extends ScriptFileCreationStatus {
  readonly success: true;
  readonly scriptFileAbsolutePath: string;
}

interface FailedScriptCreation extends ScriptFileCreationStatus {
  readonly success: false;
  readonly error: CodeRunError;
}
