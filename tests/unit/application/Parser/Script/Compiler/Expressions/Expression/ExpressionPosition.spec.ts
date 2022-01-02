import 'mocha';
import { expect } from 'chai';
import { ExpressionPosition } from '@/application/Parser/Script/Compiler/Expressions/Expression/ExpressionPosition';

describe('ExpressionPosition', () => {
  describe('ctor', () => {
    it('sets as expected', () => {
      // arrange
      const expectedStart = 0;
      const expectedEnd = 5;
      // act
      const sut = new ExpressionPosition(expectedStart, expectedEnd);
      // assert
      expect(sut.start).to.equal(expectedStart);
      expect(sut.end).to.equal(expectedEnd);
    });
    describe('throws when invalid', () => {
      // arrange
      const testCases = [
        { start: 5, end: 5, error: 'no length (start = end = 5)' },
        { start: 5, end: 3, error: 'start (5) after end (3)' },
        { start: -1, end: 3, error: 'negative start position: -1' },
      ];
      for (const testCase of testCases) {
        it(testCase.error, () => {
          // act
          const act = () => new ExpressionPosition(testCase.start, testCase.end);
          // assert
          expect(act).to.throw(testCase.error);
        });
      }
    });
  });
});
