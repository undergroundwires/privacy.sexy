import { isString } from '@/TypeHelpers';

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

export function filterEmpty(texts: readonly (string | undefined | null)[]): string[] {
  return texts
    .filter((title): title is string => Boolean(title));
}

function validateText(text: string): void {
  if (!isString(text)) {
    throw new Error(`text is not a string. It is: ${typeof text}\n${text}`);
  }
}
