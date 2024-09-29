import type { ScriptingLanguage } from '@/domain/ScriptingLanguage';

export interface CodeValidationAnalyzer {
  (
    lines: readonly CodeLine[],
    language: ScriptingLanguage,
  ): InvalidCodeLine[];
}

export interface InvalidCodeLine {
  readonly lineNumber: number;
  readonly error: string;
}

export interface CodeLine {
  readonly lineNumber: number;
  readonly text: string;
}
