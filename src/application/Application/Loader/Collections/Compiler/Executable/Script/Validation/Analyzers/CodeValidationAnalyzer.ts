import type { ScriptLanguage } from '@/domain/ScriptMetadata/ScriptLanguage';

export interface CodeValidationAnalyzer {
  (
    lines: readonly CodeLine[],
    language: ScriptLanguage,
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
