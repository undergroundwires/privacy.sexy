import 'mocha';
import { expect } from 'chai';
import { ExpressionsCompiler } from '@/application/Parser/Script/Compiler/Expressions/ExpressionsCompiler';
import { IExpressionParser } from '@/application/Parser/Script/Compiler/Expressions/Parser/IExpressionParser';
import { ExpressionStub } from '@tests/unit/stubs/ExpressionStub';
import { ExpressionParserStub } from '@tests/unit/stubs/ExpressionParserStub';
import { FunctionCallArgumentCollectionStub } from '@tests/unit/stubs/FunctionCallArgumentCollectionStub';

describe('ExpressionsCompiler', () => {
  describe('compileExpressions', () => {
    describe('returns code when it is empty or undefined', () => {
      // arrange
      const testCases = [{
        name: 'empty',
        value: '',
      }, {
        name: 'undefined',
        value: undefined,
      },
      ];
      for (const test of testCases) {
        it(`given ${test.name}`, () => {
          const expected = test.value;
          const sut = new SystemUnderTest();
          const args = new FunctionCallArgumentCollectionStub();
          // act
          const value = sut.compileExpressions(test.value, args);
          // assert
          expect(value).to.equal(expected);
        });
      }
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
            .withResult(testCase.expressions);
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
        const code = 'non-important';
        const expressions = [
          new ExpressionStub(),
          new ExpressionStub(),
        ];
        const expressionParserMock = new ExpressionParserStub()
          .withResult(expressions);
        const sut = new SystemUnderTest(expressionParserMock);
        // act
        sut.compileExpressions(code, expected);
        // assert
        expect(expressions[0].callHistory).to.have.lengthOf(1);
        expect(expressions[0].callHistory[0].args).to.equal(expected);
        expect(expressions[1].callHistory).to.have.lengthOf(1);
        expect(expressions[1].callHistory[0].args).to.equal(expected);
      });
      it('throws if arguments is undefined', () => {
        // arrange
        const expectedError = 'undefined args, send empty collection instead';
        const args = undefined;
        const expressionParserMock = new ExpressionParserStub();
        const sut = new SystemUnderTest(expressionParserMock);
        // act
        const act = () => sut.compileExpressions('code', args);
        // assert
        expect(act).to.throw(expectedError);
      });
    });
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
            .withResult(testCase.expressions);
          const sut = new SystemUnderTest(expressionParserMock);
          // act
          const act = () => sut.compileExpressions(code, testCase.args);
          // assert
          expect(act).to.throw(testCase.expectedError);
        });
      }
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
