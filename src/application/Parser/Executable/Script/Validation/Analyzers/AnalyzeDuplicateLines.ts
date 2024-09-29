import type { LanguageSyntax } from '@/application/Parser/Executable/Script/Validation/Analyzers/Syntax/LanguageSyntax';
import type { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { createSyntax, type SyntaxFactory } from './Syntax/SyntaxFactory';
import type { CodeLine, CodeValidationAnalyzer, InvalidCodeLine } from './CodeValidationAnalyzer';

export type DuplicateLinesAnalyzer = CodeValidationAnalyzer & {
  (
    ...args: [
      ...Parameters<CodeValidationAnalyzer>,
      syntaxFactory?: SyntaxFactory,
    ]
  ): ReturnType<CodeValidationAnalyzer>;
};

export const analyzeDuplicateLines: DuplicateLinesAnalyzer = (
  lines: readonly CodeLine[],
  language: ScriptingLanguage,
  syntaxFactory: SyntaxFactory = createSyntax,
) => {
  const syntax = syntaxFactory(language);
  return lines
    .map((line): CodeLineWithDuplicateOccurrences => ({
      lineNumber: line.lineNumber,
      shouldBeIgnoredInAnalysis: shouldIgnoreLine(line.text, syntax),
      duplicateLineNumbers: lines
        .filter((other) => other.text === line.text)
        .map((duplicatedLine) => duplicatedLine.lineNumber),
    }))
    .filter((line) => isNonIgnorableDuplicateLine(line))
    .map((line): InvalidCodeLine => ({
      lineNumber: line.lineNumber,
      error: `Line is duplicated at line numbers ${line.duplicateLineNumbers.join(',')}.`,
    }));
};

interface CodeLineWithDuplicateOccurrences {
  readonly lineNumber: number;
  readonly duplicateLineNumbers: readonly number[];
  readonly shouldBeIgnoredInAnalysis: boolean;
}

function isNonIgnorableDuplicateLine(line: CodeLineWithDuplicateOccurrences): boolean {
  return !line.shouldBeIgnoredInAnalysis && line.duplicateLineNumbers.length > 1;
}

function shouldIgnoreLine(codeLine: string, syntax: LanguageSyntax): boolean {
  return isCommentLine(codeLine, syntax)
    || isLineComposedEntirelyOfCommonCodeParts(codeLine, syntax);
}

function isCommentLine(codeLine: string, syntax: LanguageSyntax): boolean {
  return syntax.commentDelimiters.some(
    (delimiter) => codeLine.startsWith(delimiter),
  );
}

function isLineComposedEntirelyOfCommonCodeParts(
  codeLine: string,
  syntax: LanguageSyntax,
): boolean {
  const codeLineParts = codeLine.toLowerCase().trim().split(' ');
  return codeLineParts.every((part) => syntax.commonCodeParts.includes(part));
}
