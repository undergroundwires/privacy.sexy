export function indentText(
  text: string,
  indentLevel = 1,
): string {
  validateText(text);
  const indentation = '\t'.repeat(indentLevel);
  return splitTextIntoLines(text)
    .map((line) => (line ? `${indentation}${line}` : line))
    .join('\n');
}

export function splitTextIntoLines(text: string): string[] {
  validateText(text);
  return text
    .split(/[\r\n]+/);
}

function validateText(text: string): void {
  if (typeof text !== 'string') {
    throw new Error(`text is not a string. It is: ${typeof text}\n${text}`);
  }
}
