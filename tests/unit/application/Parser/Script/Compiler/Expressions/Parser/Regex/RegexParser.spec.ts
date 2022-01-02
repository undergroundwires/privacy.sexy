import 'mocha';
import { expect } from 'chai';
import { ExpressionEvaluator } from '@/application/Parser/Script/Compiler/Expressions/Expression/Expression';
import { IPrimitiveExpression, RegexParser } from '@/application/Parser/Script/Compiler/Expressions/Parser/Regex/RegexParser';
import { ExpressionPosition } from '@/application/Parser/Script/Compiler/Expressions/Expression/ExpressionPosition';
import { FunctionParameterStub } from '@tests/unit/stubs/FunctionParameterStub';

describe('RegexParser', () => {
  describe('findExpressions', () => {
    describe('throws when code is unexpected', () => {
      // arrange
      const testCases = [
        {
          name: 'undefined',
          value: undefined,
          expectedError: 'undefined code',
        },
        {
          name: 'empty',
          value: '',
          expectedError: 'undefined code',
        },
      ];
      for (const testCase of testCases) {
        it(`given ${testCase.name}`, () => {
          const sut = new RegexParserConcrete(/unimportant/);
          // act
          const act = () => sut.findExpressions(testCase.value);
          // assert
          expect(act).to.throw(testCase.expectedError);
        });
      }
    });
    describe('matches regex as expected', () => {
      // arrange
      const testCases = [
        {
          name: 'returns no result when regex does not match',
          regex: /hello/g,
          code: 'world',
        },
        {
          name: 'returns expected when regex matches single',
          regex: /hello/g,
          code: 'hello world',
        },
        {
          name: 'returns expected when regex matches multiple',
          regex: /l/g,
          code: 'hello world',
        },
      ];
      for (const testCase of testCases) {
        it(testCase.name, () => {
          const expected = Array.from(testCase.code.matchAll(testCase.regex));
          const matches = new Array<RegExpMatchArray>();
          const builder = (m: RegExpMatchArray): IPrimitiveExpression => {
            matches.push(m);
            return mockPrimitiveExpression();
          };
          const sut = new RegexParserConcrete(testCase.regex, builder);
          // act
          const expressions = sut.findExpressions(testCase.code);
          // assert
          expect(expressions).to.have.lengthOf(matches.length);
          expect(matches).to.deep.equal(expected);
        });
      }
    });
    it('sets evaluator as expected', () => {
      // arrange
      const expected = getEvaluatorStub();
      const regex = /hello/g;
      const code = 'hello';
      const builder = (): IPrimitiveExpression => ({
        evaluator: expected,
      });
      const sut = new RegexParserConcrete(regex, builder);
      // act
      const expressions = sut.findExpressions(code);
      // assert
      expect(expressions).to.have.lengthOf(1);
      expect(expressions[0].evaluate === expected);
    });
    it('sets parameters as expected', () => {
      // arrange
      const expected = [
        new FunctionParameterStub().withName('parameter1').withOptionality(true),
        new FunctionParameterStub().withName('parameter2').withOptionality(false),
      ];
      const regex = /hello/g;
      const code = 'hello';
      const builder = (): IPrimitiveExpression => ({
        evaluator: getEvaluatorStub(),
        parameters: expected,
      });
      const sut = new RegexParserConcrete(regex, builder);
      // act
      const expressions = sut.findExpressions(code);
      // assert
      expect(expressions).to.have.lengthOf(1);
      expect(expressions[0].parameters.all).to.deep.equal(expected);
    });
    it('sets expected position', () => {
      // arrange
      const code = 'mate date in state is fate';
      const regex = /ate/g;
      const expected = [
        new ExpressionPosition(1, 4),
        new ExpressionPosition(6, 9),
        new ExpressionPosition(15, 18),
        new ExpressionPosition(23, 26),
      ];
      const sut = new RegexParserConcrete(regex);
      // act
      const expressions = sut.findExpressions(code);
      // assert
      const actual = expressions.map((e) => e.position);
      expect(actual).to.deep.equal(expected);
    });
  });
});

function mockBuilder(): (match: RegExpMatchArray) => IPrimitiveExpression {
  return () => ({
    evaluator: getEvaluatorStub(),
  });
}
function getEvaluatorStub(): ExpressionEvaluator {
  return () => undefined;
}

function mockPrimitiveExpression(): IPrimitiveExpression {
  return {
    evaluator: getEvaluatorStub(),
  };
}

class RegexParserConcrete extends RegexParser {
  protected regex: RegExp;

  public constructor(
    regex: RegExp,
    private readonly builder = mockBuilder(),
  ) {
    super();
    this.regex = regex;
  }

  protected buildExpression(match: RegExpMatchArray): IPrimitiveExpression {
    return this.builder(match);
  }
}
