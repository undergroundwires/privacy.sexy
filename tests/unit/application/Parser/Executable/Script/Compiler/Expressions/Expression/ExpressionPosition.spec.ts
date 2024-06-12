import { describe, it, expect } from 'vitest';
import { ExpressionPosition } from '@/application/Parser/Executable/Script/Compiler/Expressions/Expression/ExpressionPosition';

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
  describe('isInInsideOf', () => {
    // arrange
    const testCases: readonly {
      name: string,
      sut: ExpressionPosition,
      potentialParent: ExpressionPosition,
      expectedResult: boolean,
    }[] = [
      {
        name: 'true; when other contains sut inside boundaries',
        sut: new ExpressionPosition(4, 8),
        potentialParent: new ExpressionPosition(0, 10),
        expectedResult: true,
      },
      {
        name: 'true; when other contains sut with same upper boundary',
        sut: new ExpressionPosition(4, 10),
        potentialParent: new ExpressionPosition(0, 10),
        expectedResult: true,
      },
      {
        name: 'true; when other contains sut with same lower boundary',
        sut: new ExpressionPosition(0, 8),
        potentialParent: new ExpressionPosition(0, 10),
        expectedResult: true,
      },
      {
        name: 'false; when other is same as sut',
        sut: new ExpressionPosition(0, 10),
        potentialParent: new ExpressionPosition(0, 10),
        expectedResult: false,
      },
      {
        name: 'false; when sut contains other',
        sut: new ExpressionPosition(0, 10),
        potentialParent: new ExpressionPosition(4, 8),
        expectedResult: false,
      },
      {
        name: 'false; when sut starts and ends before other',
        sut: new ExpressionPosition(0, 10),
        potentialParent: new ExpressionPosition(15, 25),
        expectedResult: false,
      },
      {
        name: 'false; when sut starts before other but ends inside other',
        sut: new ExpressionPosition(0, 10),
        potentialParent: new ExpressionPosition(5, 10),
        expectedResult: false,
      },
      {
        name: 'false; when sut starts inside other but ends after other',
        sut: new ExpressionPosition(5, 11),
        potentialParent: new ExpressionPosition(0, 10),
        expectedResult: false,
      },
      {
        name: 'false; when sut starts at same position but end after other',
        sut: new ExpressionPosition(0, 11),
        potentialParent: new ExpressionPosition(0, 10),
        expectedResult: false,
      },
      {
        name: 'false; when sut ends at same positions but start before other',
        sut: new ExpressionPosition(0, 10),
        potentialParent: new ExpressionPosition(1, 10),
        expectedResult: false,
      },
    ];
    for (const testCase of testCases) {
      it(testCase.name, () => {
        // act
        const actual = testCase.sut.isInInsideOf(testCase.potentialParent);
        // assert
        expect(actual).to.equal(testCase.expectedResult);
      });
    }
  });
  describe('isSame', () => {
    // arrange
    const testCases: readonly {
      name: string,
      sut: ExpressionPosition,
      other: ExpressionPosition,
      expectedResult: boolean,
    }[] = [
      {
        name: 'true; when positions are same',
        sut: new ExpressionPosition(0, 10),
        other: new ExpressionPosition(0, 10),
        expectedResult: true,
      },
      {
        name: 'false; when start position is different',
        sut: new ExpressionPosition(0, 10),
        other: new ExpressionPosition(1, 10),
        expectedResult: false,
      },
      {
        name: 'false; when end position is different',
        sut: new ExpressionPosition(0, 10),
        other: new ExpressionPosition(0, 11),
        expectedResult: false,
      },
      {
        name: 'false; when both start and end positions are different',
        sut: new ExpressionPosition(0, 10),
        other: new ExpressionPosition(20, 30),
        expectedResult: false,
      },
    ];
    for (const testCase of testCases) {
      it(testCase.name, () => {
        // act
        const actual = testCase.sut.isSame(testCase.other);
        // assert
        expect(actual).to.equal(testCase.expectedResult);
      });
    }
  });
  describe('isIntersecting', () => {
    // arrange
    const testCases: readonly {
      name: string,
      first: ExpressionPosition,
      second: ExpressionPosition,
      expectedResult: boolean,
    }[] = [
      {
        name: 'true; when one contains other inside boundaries',
        first: new ExpressionPosition(4, 8),
        second: new ExpressionPosition(0, 10),
        expectedResult: true,
      },
      {
        name: 'true; when one starts inside other\'s ending boundary without being contained',
        first: new ExpressionPosition(0, 10),
        second: new ExpressionPosition(9, 15),
        expectedResult: true,
      },
      {
        name: 'true; when positions are the same',
        first: new ExpressionPosition(0, 5),
        second: new ExpressionPosition(0, 5),
        expectedResult: true,
      },
      {
        name: 'true; when one starts inside other\'s starting boundary without being contained',
        first: new ExpressionPosition(5, 10),
        second: new ExpressionPosition(5, 11),
        expectedResult: true,
      },
      {
        name: 'false; when one starts directly after other',
        first: new ExpressionPosition(0, 10),
        second: new ExpressionPosition(10, 20),
        expectedResult: false,
      },
      {
        name: 'false; when one starts after other with margin',
        first: new ExpressionPosition(0, 10),
        second: new ExpressionPosition(100, 200),
        expectedResult: false,
      },
    ];
    for (const testCase of testCases) {
      it(testCase.name, () => {
        // act
        const actual = testCase.first.isIntersecting(testCase.second);
        // assert
        expect(actual).to.equal(testCase.expectedResult);
      });
      it(`reversed: ${testCase.name}`, () => {
        // act
        const actual = testCase.second.isIntersecting(testCase.first);
        // assert
        expect(actual).to.equal(testCase.expectedResult);
      });
    }
  });
});
