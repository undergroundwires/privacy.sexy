import { describe, it, expect } from 'vitest';
import type {
  ExpressionEvaluator, ExpressionInitParameters,
} from '@/application/Parser/Executable/Script/Compiler/Expressions/Expression/Expression';
import {
  type PrimitiveExpression, RegexParser, type ExpressionFactory, type RegexParserUtilities,
} from '@/application/Parser/Executable/Script/Compiler/Expressions/Parser/Regex/RegexParser';
import { ExpressionPosition } from '@/application/Parser/Executable/Script/Compiler/Expressions/Expression/ExpressionPosition';
import { itEachAbsentStringValue } from '@tests/unit/shared/TestCases/AbsentTests';
import { collectExceptionMessage } from '@tests/unit/shared/ExceptionCollector';
import { itThrowsContextualError } from '@tests/unit/application/Parser/Common/ContextualErrorTester';
import { ExpressionStub } from '@tests/unit/shared/Stubs/ExpressionStub';
import { FunctionParameterCollectionStub } from '@tests/unit/shared/Stubs/FunctionParameterCollectionStub';
import type { IExpression } from '@/application/Parser/Executable/Script/Compiler/Expressions/Expression/IExpression';
import { FunctionParameterStub } from '@tests/unit/shared/Stubs/FunctionParameterStub';
import type { IReadOnlyFunctionParameterCollection } from '@/application/Parser/Executable/Script/Compiler/Function/Parameter/IFunctionParameterCollection';
import type { ExpressionPositionFactory } from '@/application/Parser/Executable/Script/Compiler/Expressions/Expression/ExpressionPositionFactory';
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';
import { indentText } from '@tests/shared/Text';
import type { FunctionParameterCollectionFactory } from '@/application/Parser/Executable/Script/Compiler/Function/Parameter/FunctionParameterCollectionFactory';

describe('RegexParser', () => {
  describe('findExpressions', () => {
    describe('error handling', () => {
      describe('throws when code is absent', () => {
        itEachAbsentStringValue((absentValue) => {
          // arrange
          const expectedError = 'missing code';
          const sut = new RegexParserConcrete({
            regex: /unimportant/,
          });
          // act
          const act = () => sut.findExpressions(absentValue);
          // assert
          const errorMessage = collectExceptionMessage(act);
          expect(errorMessage).to.include(expectedError);
        }, { excludeNull: true, excludeUndefined: true });
      });
      describe('rethrows regex match errors', () => {
        // arrange
        const expectedMatchError = new TypeError('String.prototype.matchAll called with a non-global RegExp argument');
        const expectedMessage = 'Failed to match regex.';
        const expectedCodeInMessage = 'unimportant code content';
        const expectedRegexInMessage = /failing-regex-because-it-is-non-global/;
        const expectedErrorMessage = buildRethrowErrorMessage({
          message: expectedMessage,
          code: expectedCodeInMessage,
          regex: expectedRegexInMessage,
        });
        itThrowsContextualError({
          // act
          throwingAction: (wrapError) => {
            const sut = new RegexParserConcrete(
              {
                regex: expectedRegexInMessage,
                utilities: {
                  wrapError,
                },
              },
            );
            sut.findExpressions(expectedCodeInMessage);
          },
          // assert
          expectedContextMessage: expectedErrorMessage,
          expectedWrappedError: expectedMatchError,
        });
      });
      describe('rethrows expression building errors', () => {
        // arrange
        const expectedMessage = 'Failed to build expression.';
        const expectedInnerError = new Error('Expected error from building expression');
        const {
          code: expectedCodeInMessage,
          regex: expectedRegexInMessage,
        } = createCodeAndRegexMatchingOnce();
        const throwingExpressionBuilder = () => {
          throw expectedInnerError;
        };
        const expectedErrorMessage = buildRethrowErrorMessage({
          message: expectedMessage,
          code: expectedCodeInMessage,
          regex: expectedRegexInMessage,
        });
        itThrowsContextualError({
          // act
          throwingAction: (wrapError) => {
            const sut = new RegexParserConcrete(
              {
                regex: expectedRegexInMessage,
                builder: throwingExpressionBuilder,
                utilities: {
                  wrapError,
                },
              },
            );
            sut.findExpressions(expectedCodeInMessage);
          },
          // assert
          expectedWrappedError: expectedInnerError,
          expectedContextMessage: expectedErrorMessage,
        });
      });
      describe('rethrows position creation errors', () => {
        // arrange
        const expectedMessage = 'Failed to create position.';
        const expectedInnerError = new Error('Expected error from position factory');
        const {
          code: expectedCodeInMessage,
          regex: expectedRegexInMessage,
        } = createCodeAndRegexMatchingOnce();
        const throwingPositionFactory = () => {
          throw expectedInnerError;
        };
        const expectedErrorMessage = buildRethrowErrorMessage({
          message: expectedMessage,
          code: expectedCodeInMessage,
          regex: expectedRegexInMessage,
        });
        itThrowsContextualError({
          // act
          throwingAction: (wrapError) => {
            const sut = new RegexParserConcrete(
              {
                regex: expectedRegexInMessage,
                utilities: {
                  createPosition: throwingPositionFactory,
                  wrapError,
                },
              },
            );
            sut.findExpressions(expectedCodeInMessage);
          },
          // assert
          expectedWrappedError: expectedInnerError,
          expectedContextMessage: expectedErrorMessage,
        });
      });
      describe('rethrows parameter creation errors', () => {
        // arrange
        const expectedMessage = 'Failed to create parameters.';
        const expectedInnerError = new Error('Expected error from parameter collection factory');
        const {
          code: expectedCodeInMessage,
          regex: expectedRegexInMessage,
        } = createCodeAndRegexMatchingOnce();
        const throwingParameterCollectionFactory = () => {
          throw expectedInnerError;
        };
        const expectedErrorMessage = buildRethrowErrorMessage({
          message: expectedMessage,
          code: expectedCodeInMessage,
          regex: expectedRegexInMessage,
        });
        itThrowsContextualError({
          // act
          throwingAction: (wrapError) => {
            const sut = new RegexParserConcrete(
              {
                regex: expectedRegexInMessage,
                utilities: {
                  createParameterCollection: throwingParameterCollectionFactory,
                  wrapError,
                },
              },
            );
            sut.findExpressions(expectedCodeInMessage);
          },
          // assert
          expectedWrappedError: expectedInnerError,
          expectedContextMessage: expectedErrorMessage,
        });
      });
      describe('rethrows expression creation errors', () => {
        // arrange
        const expectedMessage = 'Failed to create expression.';
        const expectedInnerError = new Error('Expected error from expression factory');
        const {
          code: expectedCodeInMessage,
          regex: expectedRegexInMessage,
        } = createCodeAndRegexMatchingOnce();
        const throwingExpressionFactory = () => {
          throw expectedInnerError;
        };
        const expectedErrorMessage = buildRethrowErrorMessage({
          message: expectedMessage,
          code: expectedCodeInMessage,
          regex: expectedRegexInMessage,
        });
        itThrowsContextualError({
          // act
          throwingAction: (wrapError) => {
            const sut = new RegexParserConcrete(
              {
                regex: expectedRegexInMessage,
                utilities: {
                  createExpression: throwingExpressionFactory,
                  wrapError,
                },
              },
            );
            sut.findExpressions(expectedCodeInMessage);
          },
          // assert
          expectedWrappedError: expectedInnerError,
          expectedContextMessage: expectedErrorMessage,
        });
      });
    });
    describe('handles matched regex correctly', () => {
      // arrange
      const testScenarios: readonly {
        readonly description: string;
        readonly regex: RegExp;
        readonly code: string;
      }[] = [
        {
          description: 'non-matching regex',
          regex: /hello/g,
          code: 'world',
        },
        {
          description: 'single regex match',
          regex: /hello/g,
          code: 'hello world',
        },
        {
          description: 'multiple regex matches',
          regex: /l/g,
          code: 'hello world',
        },
      ];
      testScenarios.forEach(({
        description, code, regex,
      }) => {
        describe(description, () => {
          it('generates expressions for all matches', () => {
            // arrange
            const expectedTotalExpressions = Array.from(code.matchAll(regex)).length;
            const sut = new RegexParserConcrete({
              regex,
            });
            // act
            const expressions = sut.findExpressions(code);
            // assert
            const actualTotalExpressions = expressions.length;
            expect(actualTotalExpressions).to.equal(
              expectedTotalExpressions,
              formatAssertionMessage([
                `Expected ${actualTotalExpressions} expressions due to ${expectedTotalExpressions} matches`,
                `Expressions:\n${indentText(JSON.stringify(expressions, undefined, 2))}`,
              ]),
            );
          });
          it('builds primitive expressions for each match', () => {
            const expected = Array.from(code.matchAll(regex));
            const matches = new Array<RegExpMatchArray>();
            const builder = (m: RegExpMatchArray): PrimitiveExpression => {
              matches.push(m);
              return createPrimitiveExpressionStub();
            };
            const sut = new RegexParserConcrete({
              regex,
              builder,
            });
            // act
            sut.findExpressions(code);
            // assert
            expect(matches).to.deep.equal(expected);
          });
          it('sets positions correctly from matches', () => {
            // arrange
            const expectedMatches = [...code.matchAll(regex)];
            const { createExpression, getInitParameters } = createExpressionFactorySpy();
            const serializeRegexMatch = (match: RegExpMatchArray) => `[startPos:${match?.index ?? 'none'},length:${match?.[0]?.length ?? 'none'}]`;
            const positionsForMatches = new Map<string, ExpressionPosition>(expectedMatches.map(
              (expectedMatch) => [serializeRegexMatch(expectedMatch), new ExpressionPosition(1, 4)],
            ));
            const createPositionMock: ExpressionPositionFactory = (match) => {
              const position = positionsForMatches.get(serializeRegexMatch(match));
              return position ?? new ExpressionPosition(66, 666);
            };
            const sut = new RegexParserConcrete({
              regex,
              utilities: {
                createExpression,
                createPosition: createPositionMock,
              },
            });
            // act
            const expressions = sut.findExpressions(code);
            // assert
            const expectedPositions = [...positionsForMatches.values()];
            const actualPositions = expressions.map((e) => getInitParameters(e)?.position);
            expect(actualPositions).to.deep.equal(expectedPositions, formatAssertionMessage([
              'Actual positions do not match the expected positions.',
              `Expected total positions: ${expectedPositions.length} (due to ${expectedMatches.length} regex matches)`,
              `Actual total positions: ${actualPositions.length}`,
              `Expected positions:\n${indentText(JSON.stringify(expectedPositions, undefined, 2))}`,
              `Actual positions:\n${indentText(JSON.stringify(actualPositions, undefined, 2))}`,
            ]));
          });
        });
      });
    });
    it('sets evaluator correctly from expression', () => {
      // arrange
      const { createExpression, getInitParameters } = createExpressionFactorySpy();
      const expectedEvaluate = createEvaluatorStub();
      const { code, regex } = createCodeAndRegexMatchingOnce();
      const builder = (): PrimitiveExpression => ({
        evaluator: expectedEvaluate,
      });
      const sut = new RegexParserConcrete({
        regex,
        builder,
        utilities: {
          createExpression,
        },
      });
      // act
      const expressions = sut.findExpressions(code);
      // assert
      expect(expressions).to.have.lengthOf(1);
      const actualEvaluate = getInitParameters(expressions[0])?.evaluator;
      expect(actualEvaluate).to.equal(expectedEvaluate);
    });
    it('sets parameters correctly from expression', () => {
      // arrange
      const expectedParameters: IReadOnlyFunctionParameterCollection['all'] = [
        new FunctionParameterStub().withName('parameter1').withOptional(true),
        new FunctionParameterStub().withName('parameter2').withOptional(false),
      ];
      const regex = /hello/g;
      const code = 'hello';
      const builder = (): PrimitiveExpression => ({
        evaluator: createEvaluatorStub(),
        parameters: expectedParameters,
      });
      const parameterCollection = new FunctionParameterCollectionStub();
      const parameterCollectionFactoryStub
      : FunctionParameterCollectionFactory = () => parameterCollection;
      const { createExpression, getInitParameters } = createExpressionFactorySpy();
      const sut = new RegexParserConcrete({
        regex,
        builder,
        utilities: {
          createExpression,
          createParameterCollection: parameterCollectionFactoryStub,
        },
      });
      // act
      const expressions = sut.findExpressions(code);
      // assert
      expect(expressions).to.have.lengthOf(1);
      const actualParameters = getInitParameters(expressions[0])?.parameters;
      expect(actualParameters).to.equal(parameterCollection);
      expect(actualParameters?.all).to.deep.equal(expectedParameters);
    });
  });
});

function buildRethrowErrorMessage(
  expectedContext: {
    readonly message: string;
    readonly regex: RegExp;
    readonly code: string;
  },
): string {
  return [
    expectedContext.message,
    `Class name: ${RegexParserConcrete.name}`,
    `Regex pattern used: ${expectedContext.regex}`,
    `Code: ${expectedContext.code}`,
  ].join('\n');
}

function createExpressionFactorySpy() {
  const createdExpressions = new Map<IExpression, ExpressionInitParameters>();
  const createExpression: ExpressionFactory = (parameters) => {
    const expression = new ExpressionStub();
    createdExpressions.set(expression, parameters);
    return expression;
  };
  return {
    createExpression,
    getInitParameters: (expression) => createdExpressions.get(expression),
  };
}

function createBuilderStub(): (match: RegExpMatchArray) => PrimitiveExpression {
  return () => ({
    evaluator: createEvaluatorStub(),
  });
}
function createEvaluatorStub(): ExpressionEvaluator {
  return () => `[${createEvaluatorStub.name}] evaluated code`;
}

function createPrimitiveExpressionStub(): PrimitiveExpression {
  return {
    evaluator: createEvaluatorStub(),
  };
}

function createCodeAndRegexMatchingOnce() {
  const code = 'expected code in context';
  const regex = /code/g;
  return { code, regex };
}

class RegexParserConcrete extends RegexParser {
  private readonly builder: RegexParser['buildExpression'];

  protected regex: RegExp;

  public constructor(parameters?: {
    regex?: RegExp,
    builder?: RegexParser['buildExpression'],
    utilities?: Partial<RegexParserUtilities>,
  }) {
    super({
      wrapError: parameters?.utilities?.wrapError
        ?? (() => new Error(`[${RegexParserConcrete}] wrapped error`)),
      createPosition: parameters?.utilities?.createPosition
        ?? (() => new ExpressionPosition(0, 5)),
      createExpression: parameters?.utilities?.createExpression
        ?? (() => new ExpressionStub()),
      createParameterCollection: parameters?.utilities?.createParameterCollection
        ?? (() => new FunctionParameterCollectionStub()),
    });
    this.builder = parameters?.builder ?? createBuilderStub();
    this.regex = parameters?.regex ?? /unimportant/g;
  }

  protected buildExpression(match: RegExpMatchArray): PrimitiveExpression {
    return this.builder(match);
  }
}
