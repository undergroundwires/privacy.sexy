import { splitTextIntoLines } from '@/application/Common/Text/SplitTextIntoLines';
import type { ICodeLine } from './ICodeLine';
import type { ICodeValidationRule, IInvalidCodeLine } from './ICodeValidationRule';
import type { ICodeValidator } from './ICodeValidator';

export class CodeValidator implements ICodeValidator {
  public static readonly instance: ICodeValidator = new CodeValidator();

  public throwIfInvalid(
    code: string,
    rules: readonly ICodeValidationRule[],
  ): void {
    if (rules.length === 0) { throw new Error('missing rules'); }
    if (!code) {
      return;
    }
    const lines = extractLines(code);
    const invalidLines = rules.flatMap((rule) => rule.analyze(lines));
    if (invalidLines.length === 0) {
      return;
    }
    const errorText = `Errors with the code.\n${printLines(lines, invalidLines)}`;
    throw new Error(errorText);
  }
}

function extractLines(code: string): ICodeLine[] {
  const lines = splitTextIntoLines(code);
  return lines.map((lineText, lineIndex): ICodeLine => ({
    index: lineIndex + 1,
    text: lineText,
  }));
}

function printLines(
  lines: readonly ICodeLine[],
  invalidLines: readonly IInvalidCodeLine[],
): string {
  return lines.map((line) => {
    const badLine = invalidLines.find((invalidLine) => invalidLine.index === line.index);
    if (!badLine) {
      return `[${line.index}] ✅ ${line.text}`;
    }
    return `[${badLine.index}] ❌ ${line.text}\n\t⟶ ${badLine.error}`;
  }).join('\n');
}
