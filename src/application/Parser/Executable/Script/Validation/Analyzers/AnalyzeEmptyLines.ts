import type { CodeValidationAnalyzer, InvalidCodeLine } from './CodeValidationAnalyzer';

export const analyzeEmptyLines: CodeValidationAnalyzer = (
  lines,
) => {
  return lines
    .filter((line) => isEmptyLine(line.text))
    .map((line): InvalidCodeLine => ({
      lineNumber: line.lineNumber,
      error: (() => {
        if (!line.text) {
          return 'Empty line';
        }
        const markedText = line.text
          .replaceAll(' ', '{whitespace}')
          .replaceAll('\t', '{tab}');
        return `Empty line: "${markedText}"`;
      })(),
    }));
};

function isEmptyLine(line: string): boolean {
  return line.trim().length === 0;
}
