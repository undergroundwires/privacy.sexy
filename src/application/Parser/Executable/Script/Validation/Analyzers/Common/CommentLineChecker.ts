import type { LanguageSyntax } from '../Syntax/LanguageSyntax';

export interface CommentLineChecker {
  (
    codeLine: string,
    syntax: LanguageSyntax,
  ): boolean;
}

export const isCommentLine: CommentLineChecker = (codeLine, syntax) => {
  return syntax.commentDelimiters.some(
    (delimiter) => codeLine.toLowerCase().startsWith(delimiter.toLowerCase()),
  );
};
