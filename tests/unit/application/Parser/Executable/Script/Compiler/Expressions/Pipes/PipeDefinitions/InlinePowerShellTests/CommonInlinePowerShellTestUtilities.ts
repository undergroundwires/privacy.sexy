import { RegexBuilder } from '../PipeTestRunner';

export function joinAsWindowsLines(
  ...lines: string[]
): string {
  return lines.join('\r\n');
}

/**
 * Builds a relaxed regular expression pattern for matching inlined multiple lines of code
 * with basic semicolon merging.
 */
export function getInlinedOutputWithSemicolons(
  ...lines: string[]
): RegExp {
  const trimmedLines = lines.map((line) => line.trim());
  const builder = new RegexBuilder();
  trimmedLines.forEach((line, index) => {
    builder.withLiteralString(line);
    builder.withOptionalSemicolon(); // Semi colon at the end compiles fine
    if (index !== trimmedLines.length - 1) {
      builder.withOptionalWhitespaceButNoNewline();
    }
  });
  return builder.buildRegex();
}
