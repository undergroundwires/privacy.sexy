import type { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { isCommentLine, type CommentLineChecker } from './Common/CommentLineChecker';
import { createSyntax, type SyntaxFactory } from './Syntax/SyntaxFactory';
import type { CodeLine, CodeValidationAnalyzer, InvalidCodeLine } from './CodeValidationAnalyzer';

export type CommentOnlyCodeAnalyzer = CodeValidationAnalyzer & {
  (
    ...args: [
      ...Parameters<CodeValidationAnalyzer>,
      syntaxFactory?: SyntaxFactory,
      commentLineChecker?: CommentLineChecker,
    ]
  ): ReturnType<CodeValidationAnalyzer>;
};

export const analyzeCommentOnlyCode: CommentOnlyCodeAnalyzer = (
  lines: readonly CodeLine[],
  language: ScriptingLanguage,
  syntaxFactory: SyntaxFactory = createSyntax,
  commentLineChecker: CommentLineChecker = isCommentLine,
) => {
  const syntax = syntaxFactory(language);
  if (!lines.every((line) => commentLineChecker(line.text, syntax))) {
    return [];
  }
  return lines
    .map((line): InvalidCodeLine => ({
      lineNumber: line.lineNumber,
      error: (() => {
        return 'Code consists of comments only';
      })(),
    }));
};
