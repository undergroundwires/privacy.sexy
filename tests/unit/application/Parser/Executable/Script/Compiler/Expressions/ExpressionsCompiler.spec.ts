import { describe, it, expect } from 'vitest';
import { ExpressionsCompiler } from '@/application/Parser/Executable/Script/Compiler/Expressions/ExpressionsCompiler';
import type { IExpressionParser } from '@/application/Parser/Executable/Script/Compiler/Expressions/Parser/IExpressionParser';
import { ExpressionStub } from '@tests/unit/shared/Stubs/ExpressionStub';
import { ExpressionParserStub } from '@tests/unit/shared/Stubs/ExpressionParserStub';
import { FunctionCallArgumentCollectionStub } from '@tests/unit/shared/Stubs/FunctionCallArgumentCollectionStub';
import { itEachAbsentStringValue } from '@tests/unit/shared/TestCases/AbsentTests';
import type { IExpression } from '@/application/Parser/Executable/Script/Compiler/Expressions/Expression/IExpression';

describe('ExpressionsCompiler', () => {
  describe('compileExpressions', () => {
    describe('returns empty string when code is absent', () => {
      itEachAbsentStringValue((absentValue) => {
        // arrange
        const expected = '';
        const code = absentValue;
        const sut = new SystemUnderTest();
        const args = new FunctionCallArgumentCollectionStub();
        // act
        const value = sut.compileExpressions(code, args);
        // assert
        expect(value).to.equal(expected);
      }, { excludeNull: true, excludeUndefined: true });
    });
    describe('can compile nested expressions', () => {
      it('when one expression is evaluated to a text that contains another expression', () => {
        // arrange
        const expectedResult = 'hello world!';
        const rawCode = 'hello {{ firstExpression }}!';
        const outerExpressionResult = '{{ secondExpression }}';
        const expectedCodeAfterFirstCompilationRound = 'hello {{ secondExpression }}!';
        const innerExpressionResult = 'world';
        const expressionParserMock = new ExpressionParserStub()
          .withResult(rawCode, [
            new ExpressionStub()
              // {{ firstExpression }
              .withPosition(6, 27)
              // Parser would hit the outer expression
              .withEvaluatedResult(outerExpressionResult),
          ])
          .withResult(expectedCodeAfterFirstCompilationRound, [
            new ExpressionStub()
              // {{ secondExpression }}
              .withPosition(6, 28)
              // once the outer expression parser, compiler now parses its evaluated result
              .withEvaluatedResult(innerExpressionResult),
          ]);
        const sut = new SystemUnderTest(expressionParserMock);
        const args = new FunctionCallArgumentCollectionStub();
        // act
        const actual = sut.compileExpressions(rawCode, args);
        // assert
        expect(actual).to.equal(expectedResult);
      });
      describe('when one expression contains another hardcoded expression', () => {
        it('when hardcoded expression is does not contain the hardcoded expression', () => {
          // arrange
          const expectedResult = 'hi !';
          const rawCode = 'hi {{ outerExpressionStart }}delete {{ innerExpression }} me{{ outerExpressionEnd }}!';
          const outerExpressionResult = '';
          const innerExpressionResult = 'should not be there';
          const expressionParserMock = new ExpressionParserStub()
            .withResult(rawCode, [
              new ExpressionStub()
                // {{ outerExpressionStart }}delete {{ innerExpression }} me{{ outerExpressionEnd }}
                .withPosition(3, 84)
                .withEvaluatedResult(outerExpressionResult),
              new ExpressionStub()
                // {{ innerExpression }}
                .withPosition(36, 57)
                // Parser would hit both expressions as one is hardcoded in other
                .withEvaluatedResult(innerExpressionResult),
            ])
            .withResult(expectedResult, []);
          const sut = new SystemUnderTest(expressionParserMock);
          const args = new FunctionCallArgumentCollectionStub();
          // act
          const actual = sut.compileExpressions(rawCode, args);
          // assert
          expect(actual).to.equal(expectedResult);
        });
        it('when hardcoded expression contains the hardcoded expression', () => {
          // arrange
          const expectedResult = 'hi game of thrones!';
          const rawCode = 'hi {{ outerExpressionStart }} game {{ innerExpression }} {{ outerExpressionEnd }}!';
          const expectedCodeAfterFirstCompilationRound = 'hi game {{ innerExpression }}!'; // outer is compiled first
          const outerExpressionResult = 'game {{ innerExpression }}';
          const innerExpressionResult = 'of thrones';
          const expressionParserMock = new ExpressionParserStub()
            .withResult(rawCode, [
              new ExpressionStub()
                // {{ outerExpressionStart }} game {{ innerExpression }} {{ outerExpressionEnd }}
                .withPosition(3, 81)
                // Parser would hit the outer expression
                .withEvaluatedResult(outerExpressionResult),
              new ExpressionStub()
                // {{ innerExpression }}
                .withPosition(35, 57)
                // Parser would hit both expressions as one is hardcoded in other
                .withEvaluatedResult(innerExpressionResult),
            ])
            .withResult(expectedCodeAfterFirstCompilationRound, [
              new ExpressionStub()
                // {{ innerExpression }}
                .withPosition(8, 29)
                // once the outer expression parser, compiler now parses its evaluated result
                .withEvaluatedResult(innerExpressionResult),
            ]);
          const sut = new SystemUnderTest(expressionParserMock);
          const args = new FunctionCallArgumentCollectionStub();
          // act
          const actual = sut.compileExpressions(rawCode, args);
          // assert
          expect(actual).to.equal(expectedResult);
        });
      });
    });
    describe('combines expressions as expected', () => {
      // arrange
      const code = 'part1 {{ a }} part2 {{ b }} part3';
      const testCases = [
        {
          name: 'with ordered expressions',
          expressions: [
            new ExpressionStub().withPosition(6, 13).withEvaluatedResult('a'),
            new ExpressionStub().withPosition(20, 27).withEvaluatedResult('b'),
          ],
          expected: 'part1 a part2 b part3',
        },
        {
          name: 'unordered expressions',
          expressions: [
            new ExpressionStub().withPosition(20, 27).withEvaluatedResult('b'),
            new ExpressionStub().withPosition(6, 13).withEvaluatedResult('a'),
          ],
          expected: 'part1 a part2 b part3',
        },
        {
          name: 'with an optional expected argument that is not provided',
          expressions: [
            new ExpressionStub().withPosition(6, 13).withEvaluatedResult('a')
              .withParameterNames(['optionalParameter'], true),
            new ExpressionStub().withPosition(20, 27).withEvaluatedResult('b')
              .withParameterNames(['optionalParameterTwo'], true),
          ],
          expected: 'part1 a part2 b part3',
        },
        {
          name: 'with no expressions',
          expressions: [],
          expected: code,
        },
      ];
      for (const testCase of testCases) {
        it(testCase.name, () => {
          const expressionParserMock = new ExpressionParserStub()
            .withResult(code, testCase.expressions);
          const args = new FunctionCallArgumentCollectionStub();
          const sut = new SystemUnderTest(expressionParserMock);
          // act
          const actual = sut.compileExpressions(code, args);
          // assert
          expect(actual).to.equal(testCase.expected);
        });
      }
    });
    describe('arguments', () => {
      it('passes arguments to expressions as expected', () => {
        // arrange
        const expected = new FunctionCallArgumentCollectionStub()
          .withArgument('test-arg', 'test-value');
        const code = 'longer than 6 characters';
        const expressions = [
          new ExpressionStub().withPosition(0, 3),
          new ExpressionStub().withPosition(3, 6),
        ];
        const expressionParserMock = new ExpressionParserStub()
          .withResult(code, expressions);
        const sut = new SystemUnderTest(expressionParserMock);
        // act
        sut.compileExpressions(code, expected);
        // assert
        const actualArgs = expressions
          .flatMap((expression) => expression.callHistory)
          .map((context) => context.args);
        expect(
          actualArgs.every((arg) => arg === expected),
          `Expected: ${JSON.stringify(expected)}\n`
          + `Actual: ${JSON.stringify(actualArgs)}\n`
          + `Not equal: ${actualArgs.filter((arg) => arg !== expected)}`,
        );
      });
    });
    describe('throws when expressions are invalid', () => {
      describe('throws when expected argument is not provided but used in code', () => {
        // arrange
        const testCases = [
          {
            name: 'empty parameters',
            expressions: [
              new ExpressionStub().withParameterNames(['parameter'], false),
            ],
            args: new FunctionCallArgumentCollectionStub(),
            expectedError: 'parameter value(s) not provided for: "parameter" but used in code',
          },
          {
            name: 'unnecessary parameter is provided',
            expressions: [
              new ExpressionStub().withParameterNames(['parameter'], false),
            ],
            args: new FunctionCallArgumentCollectionStub()
              .withArgument('unnecessaryParameter', 'unnecessaryValue'),
            expectedError: 'parameter value(s) not provided for: "parameter" but used in code',
          },
          {
            name: 'multiple values are not provided',
            expressions: [
              new ExpressionStub().withParameterNames(['parameter1'], false),
              new ExpressionStub().withParameterNames(['parameter2', 'parameter3'], false),
            ],
            args: new FunctionCallArgumentCollectionStub(),
            expectedError: 'parameter value(s) not provided for: "parameter1", "parameter2", "parameter3" but used in code',
          },
          {
            name: 'some values are provided',
            expressions: [
              new ExpressionStub().withParameterNames(['parameter1'], false),
              new ExpressionStub().withParameterNames(['parameter2', 'parameter3'], false),
            ],
            args: new FunctionCallArgumentCollectionStub()
              .withArgument('parameter2', 'value'),
            expectedError: 'parameter value(s) not provided for: "parameter1", "parameter3" but used in code',
          },
          {
            name: 'parameter names are not repeated in error message',
            expressions: [
              new ExpressionStub().withParameterNames(['parameter1', 'parameter1', 'parameter2', 'parameter2'], false),
            ],
            args: new FunctionCallArgumentCollectionStub(),
            expectedError: 'parameter value(s) not provided for: "parameter1", "parameter2" but used in code',
          },
        ];
        for (const testCase of testCases) {
          it(testCase.name, () => {
            const code = 'non-important-code';
            const expressionParserMock = new ExpressionParserStub()
              .withResult(code, testCase.expressions);
            const sut = new SystemUnderTest(expressionParserMock);
            // act
            const act = () => sut.compileExpressions(code, testCase.args);
            // assert
            expect(act).to.throw(testCase.expectedError);
          });
        }
      });
      describe('throws when expression positions are unexpected', () => {
        // arrange
        const code = 'c'.repeat(30);
        const testCases: readonly {
          name: string,
          expressions: readonly IExpression[],
          expectedError: string,
          expectedResult: boolean,
        }[] = [
          (() => {
            const badExpression = new ExpressionStub().withPosition(0, code.length + 5);
            const goodExpression = new ExpressionStub().withPosition(0, code.length - 1);
            return {
              name: 'an expression has out-of-range position',
              expressions: [badExpression, goodExpression],
              expectedError: `Expressions out of range:\n${JSON.stringify([badExpression])}`,
              expectedResult: true,
            };
          })(),
          (() => {
            const duplicatedExpression = new ExpressionStub().withPosition(0, code.length - 1);
            const uniqueExpression = new ExpressionStub().withPosition(0, code.length - 2);
            return {
              name: 'two expressions at the same position',
              expressions: [duplicatedExpression, duplicatedExpression, uniqueExpression],
              expectedError: `Instructions at same position:\n${JSON.stringify([duplicatedExpression, duplicatedExpression])}`,
              expectedResult: true,
            };
          })(),
          (() => {
            const goodExpression = new ExpressionStub().withPosition(0, 5);
            const intersectingExpression = new ExpressionStub().withPosition(5, 10);
            const intersectingExpressionOther = new ExpressionStub().withPosition(7, 12);
            return {
              name: 'intersecting expressions',
              expressions: [goodExpression, intersectingExpression, intersectingExpressionOther],
              expectedError: `Instructions intersecting unexpectedly:\n${JSON.stringify([intersectingExpression, intersectingExpressionOther])}`,
              expectedResult: true,
            };
          })(),
        ];
        for (const testCase of testCases) {
          it(testCase.name, () => {
            const expressionParserMock = new ExpressionParserStub()
              .withResult(code, testCase.expressions);
            const sut = new SystemUnderTest(expressionParserMock);
            const args = new FunctionCallArgumentCollectionStub();
            // act
            const act = () => sut.compileExpressions(code, args);
            // assert
            expect(act).to.throw(testCase.expectedError);
          });
        }
      });
    });
    it('calls parser with expected code', () => {
      // arrange
      const expected = 'expected-code';
      const expressionParserMock = new ExpressionParserStub();
      const sut = new SystemUnderTest(expressionParserMock);
      const args = new FunctionCallArgumentCollectionStub();
      // act
      sut.compileExpressions(expected, args);
      // assert
      expect(expressionParserMock.callHistory).to.have.lengthOf(1);
      expect(expressionParserMock.callHistory[0]).to.equal(expected);
    });
  });
});

class SystemUnderTest extends ExpressionsCompiler {
  constructor(extractor: IExpressionParser = new ExpressionParserStub()) {
    super(extractor);
  }
}
