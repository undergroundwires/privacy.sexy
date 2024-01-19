import { describe, it, expect } from 'vitest';
import { createPositionFromRegexFullMatch } from '@/application/Parser/Script/Compiler/Expressions/Expression/ExpressionPositionFactory';
import { ExpressionPosition } from '@/application/Parser/Script/Compiler/Expressions/Expression/ExpressionPosition';

describe('ExpressionPositionFactory', () => {
  describe('createPositionFromRegexFullMatch', () => {
    it(`creates ${ExpressionPosition.name} instance`, () => {
      // arrange
      const expectedType = ExpressionPosition;
      const fakeMatch = createRegexMatch({
        fullMatch: 'matched string',
        matchIndex: 5,
      });
      // act
      const position = createPositionFromRegexFullMatch(fakeMatch);
      // assert
      expect(position).to.be.instanceOf(expectedType);
    });

    it('creates a position with the correct start position', () => {
      // arrange
      const expectedStartPosition = 5;
      const fakeMatch = createRegexMatch({
        fullMatch: 'matched string',
        matchIndex: expectedStartPosition,
      });
      // act
      const position = createPositionFromRegexFullMatch(fakeMatch);
      // assert
      expect(position.start).toBe(expectedStartPosition);
    });

    it('creates a position with the correct end position', () => {
      // arrange
      const startPosition = 3;
      const matchedString = 'matched string';
      const expectedEndPosition = startPosition + matchedString.length;
      const fakeMatch = createRegexMatch({
        fullMatch: matchedString,
        matchIndex: startPosition,
      });
      // act
      const position = createPositionFromRegexFullMatch(fakeMatch);
      // assert
      expect(position.end).to.equal(expectedEndPosition);
    });

    it('creates correct position with capturing groups', () => {
      // arrange
      const startPosition = 20;
      const fakeMatch = createRegexMatch({
        fullMatch: 'matched string',
        capturingGroups: ['group1', 'group2'],
        matchIndex: startPosition,
      });
      // act
      const position = createPositionFromRegexFullMatch(fakeMatch);
      // assert
      expect(position.start).toBe(startPosition);
      expect(position.end).toBe(startPosition + fakeMatch[0].length);
    });

    describe('invalid values', () => {
      it('throws an error if match.index is undefined', () => {
        // arrange
        const fakeMatch = createRegexMatch({
          fullMatch: 'matched string',
          matchIndex: undefined,
        });
        const expectedError = `Regex match did not yield any results: ${JSON.stringify(fakeMatch)}`;
        // act
        const act = () => createPositionFromRegexFullMatch(fakeMatch);
        // assert
        expect(act).to.throw(expectedError);
      });
      it('throws an error for empty match', () => {
        // arrange
        const fakeMatch = createRegexMatch({
          fullMatch: '',
          matchIndex: 0,
        });
        const expectedError = `Regex match is empty: ${JSON.stringify(fakeMatch)}`;
        // act
        const act = () => createPositionFromRegexFullMatch(fakeMatch);
        // assert
        expect(act).to.throw(expectedError);
      });
    });
  });
});

function createRegexMatch(options?: {
  readonly fullMatch?: string,
  readonly capturingGroups?: readonly string[],
  readonly matchIndex?: number,
}): RegExpMatchArray {
  const fullMatch = options?.fullMatch ?? 'fake match';
  const capturingGroups = options?.capturingGroups ?? [];
  const fakeMatch: RegExpMatchArray = [fullMatch, ...capturingGroups];
  fakeMatch.index = options?.matchIndex;
  return fakeMatch;
}
