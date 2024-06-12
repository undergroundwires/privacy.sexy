import { ExpressionPosition } from './ExpressionPosition';

export interface ExpressionPositionFactory {
  (
    match: RegExpMatchArray,
  ): ExpressionPosition
}

export const createPositionFromRegexFullMatch
: ExpressionPositionFactory = (match) => {
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
};
