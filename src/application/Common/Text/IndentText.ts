import { isString } from '@/TypeHelpers';
import { splitTextIntoLines } from './SplitTextIntoLines';

export function indentText(
  text: string,
  indentLevel = 1,
  utilities: TextIndentationUtilities = DefaultUtilities,
): string {
  if (!utilities.isStringType(text)) {
    throw new Error(`Indentation error: The input must be a string. Received type: ${typeof text}.`);
  }
  if (indentLevel <= 0) {
    throw new Error(`Indentation error: The indent level must be a positive integer. Received: ${indentLevel}.`);
  }
  const indentation = '\t'.repeat(indentLevel);
  return utilities.splitIntoLines(text)
    .map((line) => (line ? `${indentation}${line}` : line))
    .join('\n');
}

interface TextIndentationUtilities {
  readonly splitIntoLines: typeof splitTextIntoLines;
  readonly isStringType: typeof isString;
}

const DefaultUtilities: TextIndentationUtilities = {
  splitIntoLines: splitTextIntoLines,
  isStringType: isString,
};
