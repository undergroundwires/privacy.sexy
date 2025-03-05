import type { CodeLine } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Validation/Analyzers/CodeValidationAnalyzer';

export function createCodeLines(lines: readonly string[]): CodeLine[] {
  return lines.map((lineText, index): CodeLine => (
    {
      lineNumber: index + 1,
      text: lineText,
    }
  ));
}
