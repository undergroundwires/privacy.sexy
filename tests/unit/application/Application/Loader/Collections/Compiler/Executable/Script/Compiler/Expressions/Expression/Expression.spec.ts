import { describe, it, expect } from 'vitest';
import { ExpressionPosition } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Expressions/Expression/ExpressionPosition';
import { type ExpressionEvaluator, Expression } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Expressions/Expression/Expression';
import type { IReadOnlyFunctionCallArgumentCollection } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Function/Call/Argument/IFunctionCallArgumentCollection';
import { FunctionCallArgumentCollectionStub } from '@tests/unit/shared/Stubs/FunctionCallArgumentCollectionStub';
import { FunctionParameterCollectionStub } from '@tests/unit/shared/Stubs/FunctionParameterCollectionStub';
import { FunctionCallArgumentStub } from '@tests/unit/shared/Stubs/FunctionCallArgumentStub';
import { ExpressionEvaluationContextStub } from '@tests/unit/shared/Stubs/ExpressionEvaluationContextStub';
import type { IPipelineCompiler } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Expressions/Pipes/IPipelineCompiler';
import { PipelineCompilerStub } from '@tests/unit/shared/Stubs/PipelineCompilerStub';
import type { IReadOnlyFunctionParameterCollection } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Function/Parameter/IFunctionParameterCollection';
import { itEachAbsentObjectValue } from '@tests/unit/shared/TestCases/AbsentTests';
import type { IExpressionEvaluationContext } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Compiler/Expressions/Expression/ExpressionEvaluationContext';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';
import { collectExceptionMessage } from '@tests/unit/shared/ExceptionCollector';
import { indentText } from '@/application/Common/Text/IndentText';

describe('Expression', () => {
  describe('ctor', () => {
    describe('position', () => {
      it('sets as expected', () => {
        // arrange
        const expected = new ExpressionPosition(0, 5);
        // act
        const actual = new ExpressionBuilder()
          .withPosition(expected)
          .build();
        // assert
        expect(actual.position).to.equal(expected);
      });
    });
    describe('parameters', () => {
      describe('defaults to empty array if absent', () => {
        itEachAbsentObjectValue((absentValue) => {
          // arrange
          const parameters = absentValue;
          // act
          const actual = new ExpressionBuilder()
            .withParameters(parameters)
            .build();
          // assert
          expect(actual.parameters);
          expect(actual.parameters.all);
          expect(actual.parameters.all.length).to.equal(0);
        }, { excludeNull: true });
      });
      it('sets as expected', () => {
        // arrange
        const expected = new FunctionParameterCollectionStub()
          .withParameterName('firstParameterName')
          .withParameterName('secondParameterName');
        // act
        const actual = new ExpressionBuilder()
          .withParameters(expected)
          .build();
        // assert
        expect(actual.parameters).to.deep.equal(expected);
      });
    });
  });
  describe('evaluate', () => {
    describe('validation', () => {
      describe('throws when argument value is missing for required parameters', () => {
        const testScenarios: readonly {
          readonly name: string;
          readonly context: IExpressionEvaluationContext;
          readonly sutBuilder?: (builder: ExpressionBuilder) => ExpressionBuilder;
          readonly assert: {
            readonly expectedErrorParts: readonly string[];
            readonly notExpectedErrorParts?: readonly string[];
          }
        }[] = [
          {
            name: 'when single required arg is not provided',
            sutBuilder: (i: ExpressionBuilder) => i.withParameterNames([
              'parameterA',
            ], false),
            context: new ExpressionEvaluationContextStub()
              .withArgs(new FunctionCallArgumentCollectionStub()),
            assert: {
              expectedErrorParts: ['parameterA'],
            },
          },
          {
            name: 'when some of the required args are not provided',
            sutBuilder: (i: ExpressionBuilder) => i.withParameterNames([
              'parameterA', 'parameterB', 'parameterC',
            ], false),
            context: new ExpressionEvaluationContextStub()
              .withArgs(
                new FunctionCallArgumentCollectionStub()
                  .withArgument('parameterB', 'provided'),
              ),
            assert: {
              expectedErrorParts: ['parameterA', 'parameterC'],
              notExpectedErrorParts: ['parameterB'],
            },
          },
          {
            name: 'when none of the required args are not provided',
            sutBuilder: (i: ExpressionBuilder) => i.withParameterNames([
              'parameterA', 'parameterB', 'parameterC',
            ], false),
            context: new ExpressionEvaluationContextStub()
              .withArgs(new FunctionCallArgumentCollectionStub()),
            assert: {
              expectedErrorParts: ['parameterA', 'parameterB', 'parameterC'],
            },
          },
          {
            name: 'when none of the required args are not provided',
            sutBuilder: (i: ExpressionBuilder) => i.withParameterNames([
              'parameterA', 'parameterB',
            ], false),
            context: new ExpressionEvaluationContextStub()
              .withArgs(new FunctionCallArgumentCollectionStub()),
            assert: {
              expectedErrorParts: ['parameterA', 'parameterB'],
            },
          },
        ];
        testScenarios.forEach((test) => {
          it(test.name, () => {
            // arrange
            const commonExpectedErrorMessagePart = 'Used parameters missing values';
            const sutBuilder = new ExpressionBuilder();
            if (test.sutBuilder) {
              test.sutBuilder(sutBuilder);
            }
            const sut = sutBuilder.build();
            // act
            const act = () => sut.evaluate(test.context);
            // assert
            const actualErrorMessage = collectExceptionMessage(act);
            const allExpectedErrorParts = [
              commonExpectedErrorMessagePart,
              ...test.assert.expectedErrorParts,
            ];
            allExpectedErrorParts.forEach((part) => {
              expect(actualErrorMessage).to.include(part, formatAssertionMessage([
                'Error message contains unexpected content',
                `Expected NOT to find: "${part}"`,
                'Actual error message:',
                indentText(actualErrorMessage),
              ]));
            });
            test.assert.notExpectedErrorParts?.forEach((part) => {
              expect(actualErrorMessage).to.not.include(part, formatAssertionMessage([
                'Error message contains unexpected content',
                `Expected NOT to find: "${part}"`,
                'Actual error message:',
                indentText(actualErrorMessage),
              ]));
            });
          });
        });
      });
      it('deduplicates repeated parameter names in errors', () => {
        // arrange
        const parameterName = 'expectedParameterName';
        const sut = new ExpressionBuilder()
          .withParameterName(parameterName, false)
          .withParameterName(parameterName, false)
          .withParameterName(parameterName, false)
          .build();
        const context = new ExpressionEvaluationContextStub()
          .withArgs(new FunctionCallArgumentCollectionStub());
        // act
        const act = () => sut.evaluate(context);
        // assert
        const actualErrorMessage = collectExceptionMessage(act);
        const totalOccurrences = (actualErrorMessage.match(new RegExp(parameterName, 'g')) || []).length;
        expect(totalOccurrences).to.equal(1, formatAssertionMessage([
          'Parameter name should appear exactly once in error message',
          `Found occurrences: ${totalOccurrences}`,
          `Parameter name: "${parameterName}"`,
          'Error message:',
          indentText(actualErrorMessage),
        ]));
      });
      it('accepts missing optional parameters', () => {
        // arrange
        const parameterName = 'optionalParameterName';
        const sut = new ExpressionBuilder()
          .withParameterName(parameterName, true)
          .build();
        const context = new ExpressionEvaluationContextStub()
          .withArgs(new FunctionCallArgumentCollectionStub());
        // act
        const act = () => sut.evaluate(context);
        // assert
        expect(act).to.not.throw(formatAssertionMessage([
          'Optional parameters should not cause validation errors when no argument value is provided',
          `Parameter name: "${parameterName}"`,
        ]));
      });
    });
    it('returns result from evaluator', () => {
      // arrange
      const evaluatorMock: ExpressionEvaluator = (c) => `"${c
        .args
        .getAllParameterNames()
        .map((name) => context.args.getArgument(name))
        .map((arg) => `${arg.parameterName}': '${arg.argumentValue}'`)
        .join('", "')}"`;
      const givenArguments = new FunctionCallArgumentCollectionStub()
        .withArgument('parameter1', 'value1')
        .withArgument('parameter2', 'value2');
      const expectedParameterNames = givenArguments.getAllParameterNames();
      const context = new ExpressionEvaluationContextStub()
        .withArgs(givenArguments);
      const expected = evaluatorMock(context);
      const sut = new ExpressionBuilder()
        .withEvaluator(evaluatorMock)
        .withParameterNames(expectedParameterNames)
        .build();
      // arrange
      const actual = sut.evaluate(context);
      // assert
      expect(expected).to.equal(actual, formatAssertionMessage([
        `Given arguments: ${JSON.stringify(givenArguments)}`,
        `Expected parameter names: ${JSON.stringify(expectedParameterNames)}`,
      ]));
    });
    it('sends pipeline compiler as it is', () => {
      // arrange
      const expected = new PipelineCompilerStub();
      const context = new ExpressionEvaluationContextStub()
        .withPipelineCompiler(expected);
      let actual: IPipelineCompiler | undefined;
      const evaluatorMock: ExpressionEvaluator = (c) => {
        actual = c.pipelineCompiler;
        return '';
      };
      const sut = new ExpressionBuilder()
        .withEvaluator(evaluatorMock)
        .build();
      // arrange
      sut.evaluate(context);
      // assert
      expectExists(actual);
      expect(expected).to.equal(actual);
    });
    describe('filters unused parameters', () => {
      // arrange
      const testCases = [
        {
          name: 'with a provided argument',
          expressionParameters: new FunctionParameterCollectionStub()
            .withParameterName('parameterToHave', false),
          arguments: new FunctionCallArgumentCollectionStub()
            .withArgument('parameterToHave', 'value-to-have')
            .withArgument('parameterToIgnore', 'value-to-ignore'),
          expectedArguments: [
            new FunctionCallArgumentStub()
              .withParameterName('parameterToHave').withArgumentValue('value-to-have'),
          ],
        },
        {
          name: 'without a provided argument',
          expressionParameters: new FunctionParameterCollectionStub()
            .withParameterName('parameterToHave', false)
            .withParameterName('parameterToIgnore', true),
          arguments: new FunctionCallArgumentCollectionStub()
            .withArgument('parameterToHave', 'value-to-have'),
          expectedArguments: [
            new FunctionCallArgumentStub()
              .withParameterName('parameterToHave').withArgumentValue('value-to-have'),
          ],
        },
      ];
      for (const testCase of testCases) {
        it(testCase.name, () => {
          let actual: IReadOnlyFunctionCallArgumentCollection | undefined;
          const evaluatorMock: ExpressionEvaluator = (c) => {
            actual = c.args;
            return '';
          };
          const context = new ExpressionEvaluationContextStub()
            .withArgs(testCase.arguments);
          const sut = new ExpressionBuilder()
            .withEvaluator(evaluatorMock)
            .withParameters(testCase.expressionParameters)
            .build();
          // act
          sut.evaluate(context);
          // assert
          expectExists(actual);
          const collection = actual;
          const actualArguments = collection.getAllParameterNames()
            .map((name) => collection.getArgument(name));
          expect(actualArguments).to.deep.equal(testCase.expectedArguments);
        });
      }
    });
  });
});

class ExpressionBuilder {
  private position: ExpressionPosition = new ExpressionPosition(0, 5);

  private parameters?: IReadOnlyFunctionParameterCollection = new FunctionParameterCollectionStub();

  public withPosition(position: ExpressionPosition) {
    this.position = position;
    return this;
  }

  public withEvaluator(evaluator: ExpressionEvaluator) {
    this.evaluator = evaluator;
    return this;
  }

  public withParameters(parameters: IReadOnlyFunctionParameterCollection | undefined) {
    this.parameters = parameters;
    return this;
  }

  public withParameterName(parameterName: string, isOptional = true) {
    const collection = new FunctionParameterCollectionStub()
      .withParameterName(parameterName, isOptional);
    return this.withParameters(collection);
  }

  public withParameterNames(parameterNames: string[], isOptional = true) {
    const collection = new FunctionParameterCollectionStub()
      .withParameterNames(parameterNames, isOptional);
    return this.withParameters(collection);
  }

  public build() {
    return new Expression({
      position: this.position,
      evaluator: this.evaluator,
      parameters: this.parameters,
    });
  }

  private evaluator: ExpressionEvaluator = () => `[${ExpressionBuilder.name}] evaluated-expression`;
}
