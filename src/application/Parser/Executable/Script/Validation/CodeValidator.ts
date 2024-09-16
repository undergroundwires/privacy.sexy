import { splitTextIntoLines } from '@/application/Common/Text/SplitTextIntoLines';
import type { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { createValidationAnalyzers, type ValidationRuleAnalyzerFactory } from './ValidationRuleAnalyzerFactory';
import type { CodeLine, InvalidCodeLine } from './Analyzers/CodeValidationAnalyzer';
import type { CodeValidationRule } from './CodeValidationRule';

export interface CodeValidator {
  (
    code: string,
    language: ScriptingLanguage,
    rules: readonly CodeValidationRule[],
    analyzerFactory?: ValidationRuleAnalyzerFactory,
  ): void;
}

export const validateCode: CodeValidator = (
  code,
  language,
  rules,
  analyzerFactory = createValidationAnalyzers,
) => {
  const analyzers = analyzerFactory(rules);
  if (!code) {
    return;
  }
  const lines = extractLines(code);
  const invalidLines = analyzers.flatMap((analyze) => analyze(lines, language));
  if (invalidLines.length === 0) {
    return;
  }
  const errorText = `Errors with the code.\n${formatLines(lines, invalidLines)}`;
  throw new Error(errorText);
};

function extractLines(code: string): CodeLine[] {
  const lines = splitTextIntoLines(code);
  return lines.map((lineText, lineIndex): CodeLine => ({
    lineNumber: lineIndex + 1,
    text: lineText,
  }));
}

function formatLines(
  lines: readonly CodeLine[],
  invalidLines: readonly InvalidCodeLine[],
): string {
  return lines.map((line) => {
    const badLine = invalidLines.find((invalidLine) => invalidLine.lineNumber === line.lineNumber);
    return formatLine({
      lineNumber: line.lineNumber,
      text: line.text,
      error: badLine?.error,
    });
  }).join('\n');
}
function formatLine(
  line: {
    readonly lineNumber: number;
    readonly text: string;
    readonly error?: string;
  },
): string {
  let text = `[${line.lineNumber}] `;
  text += line.error ? '❌' : '✅';
  text += ` ${trimLine(line.text)}`;
  if (line.error) {
    text += `\n\t⟶ ${line.error}`;
  }
  return text;
}

function trimLine(line: string) {
  const maxLength = 500;
  if (line.length > maxLength) {
    line = `${line.substring(0, maxLength)}... [Rest of the line trimmed]`;
  }
  return line;
}
