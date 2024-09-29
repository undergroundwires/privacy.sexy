import { isString } from '@/TypeHelpers';

export function splitTextIntoLines(
  text: string,
  isStringType = isString,
): string[] {
  if (!isStringType(text)) {
    throw new Error(`Line splitting error: Expected a string but received type '${typeof text}'.`);
  }
  return text.split(/\r\n|\r|\n/);
}
