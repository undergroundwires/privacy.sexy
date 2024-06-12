import { describe, it, expect } from 'vitest';
import type { IExpression } from '@/application/Parser/Executable/Script/Compiler/Expressions/Expression/IExpression';
import type { IExpressionParser } from '@/application/Parser/Executable/Script/Compiler/Expressions/Parser/IExpressionParser';
import { CompositeExpressionParser } from '@/application/Parser/Executable/Script/Compiler/Expressions/Parser/CompositeExpressionParser';
import { ExpressionStub } from '@tests/unit/shared/Stubs/ExpressionStub';
import { itEachAbsentCollectionValue } from '@tests/unit/shared/TestCases/AbsentTests';

describe('CompositeExpressionParser', () => {
  describe('ctor', () => {
    describe('throws when parsers are missing', () => {
      itEachAbsentCollectionValue<IExpressionParser>((absentCollection) => {
        // arrange
        const expectedError = 'missing leafs';
        const parsers = absentCollection;
        // act
        const act = () => new CompositeExpressionParser(parsers);
        // assert
        expect(act).to.throw(expectedError);
      }, { excludeUndefined: true, excludeNull: true });
    });
  });
  describe('findExpressions', () => {
    describe('returns result from parsers as expected', () => {
      // arrange
      const pool = [
        new ExpressionStub(), new ExpressionStub(), new ExpressionStub(),
        new ExpressionStub(), new ExpressionStub(),
      ];
      const testCases = [
        {
          name: 'from single parsing none',
          parsers: [mockParser()],
          expected: [],
        },
        {
          name: 'from single parsing single',
          parsers: [mockParser(pool[0])],
          expected: [pool[0]],
        },
        {
          name: 'from single parsing multiple',
          parsers: [mockParser(pool[0], pool[1])],
          expected: [pool[0], pool[1]],
        },
        {
          name: 'from multiple parsers with each parsing single',
          parsers: [
            mockParser(pool[0]),
            mockParser(pool[1]),
            mockParser(pool[2]),
          ],
          expected: [pool[0], pool[1], pool[2]],
        },
        {
          name: 'from multiple parsers with each parsing multiple',
          parsers: [
            mockParser(pool[0], pool[1]),
            mockParser(pool[2], pool[3], pool[4])],
          expected: [pool[0], pool[1], pool[2], pool[3], pool[4]],
        },
        {
          name: 'from multiple parsers with only some parsing',
          parsers: [
            mockParser(pool[0], pool[1]),
            mockParser(),
            mockParser(pool[2]),
            mockParser(),
          ],
          expected: [pool[0], pool[1], pool[2]],
        },
      ];
      for (const testCase of testCases) {
        it(testCase.name, () => {
          const sut = new CompositeExpressionParser(testCase.parsers);
          // act
          const result = sut.findExpressions('non-important-code');
          // expect
          expect(result).to.deep.equal(testCase.expected);
        });
      }
    });
  });
});

function mockParser(...result: IExpression[]): IExpressionParser {
  return {
    findExpressions: () => result,
  };
}
