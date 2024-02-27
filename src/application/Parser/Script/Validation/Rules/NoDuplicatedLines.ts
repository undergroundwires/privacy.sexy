import type { ILanguageSyntax } from '@/application/Parser/Script/Validation/Syntax/ILanguageSyntax';
import type { ICodeLine } from '../ICodeLine';
import type { ICodeValidationRule, IInvalidCodeLine } from '../ICodeValidationRule';

export class NoDuplicatedLines implements ICodeValidationRule {
  constructor(private readonly syntax: ILanguageSyntax) { }

  public analyze(lines: readonly ICodeLine[]): IInvalidCodeLine[] {
    return lines
      .map((line): IDuplicateAnalyzedLine => ({
        index: line.index,
        isIgnored: shouldIgnoreLine(line.text, this.syntax),
        occurrenceIndices: lines
          .filter((other) => other.text === line.text)
          .map((duplicatedLine) => duplicatedLine.index),
      }))
      .filter((line) => hasInvalidDuplicates(line))
      .map((line): IInvalidCodeLine => ({
        index: line.index,
        error: `Line is duplicated at line numbers ${line.occurrenceIndices.join(',')}.`,
      }));
  }
}

interface IDuplicateAnalyzedLine {
  readonly index: number;
  readonly occurrenceIndices: readonly number[];
  readonly isIgnored: boolean;
}

function hasInvalidDuplicates(line: IDuplicateAnalyzedLine): boolean {
  return !line.isIgnored && line.occurrenceIndices.length > 1;
}

function shouldIgnoreLine(codeLine: string, syntax: ILanguageSyntax): boolean {
  const lowerCaseCodeLine = codeLine.toLowerCase();
  const isCommentLine = () => syntax.commentDelimiters.some(
    (delimiter) => lowerCaseCodeLine.startsWith(delimiter),
  );
  const consistsOfFrequentCommands = () => {
    const trimmed = lowerCaseCodeLine.trim().split(' ');
    return trimmed.every((part) => syntax.commonCodeParts.includes(part));
  };
  return isCommentLine() || consistsOfFrequentCommands();
}
