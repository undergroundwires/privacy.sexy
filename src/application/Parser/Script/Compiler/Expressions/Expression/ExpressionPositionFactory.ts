import { ExpressionPosition } from './ExpressionPosition';

export function createPositionFromRegexFullMatch(
  match: RegExpMatchArray,
): ExpressionPosition {
  const startPos = match.index;
  if (startPos === undefined) {
    throw new Error(`Regex match did not yield any results: ${JSON.stringify(match)}`);
  }
  const fullMatch = match[0];
  if (!fullMatch.length) {
    throw new Error(`Regex match is empty: ${JSON.stringify(match)}`);
  }
  const endPos = startPos + fullMatch.length;
  return new ExpressionPosition(startPos, endPos);
}
