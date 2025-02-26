import { expect, describe, it } from 'vitest';
import type { ArgumentCompiler } from '@/application/Parser/Executable/Script/Compiler/Function/Call/Compiler/SingleCall/Strategies/Argument/ArgumentCompiler';
import type { FunctionCallCompilationContext } from '@/application/Parser/Executable/Script/Compiler/Function/Call/Compiler/FunctionCallCompilationContext';
import type { FunctionCall } from '@/application/Parser/Executable/Script/Compiler/Function/Call/FunctionCall';
import { NestedFunctionArgumentCompiler } from '@/application/Parser/Executable/Script/Compiler/Function/Call/Compiler/SingleCall/Strategies/Argument/NestedFunctionArgumentCompiler';
import type { IExpressionsCompiler } from '@/application/Parser/Executable/Script/Compiler/Expressions/IExpressionsCompiler';
import { ExpressionsCompilerStub } from '@tests/unit/shared/Stubs/ExpressionsCompilerStub';
import { FunctionCallCompilationContextStub } from '@tests/unit/shared/Stubs/FunctionCallCompilationContextStub';
import { FunctionCallStub } from '@tests/unit/shared/Stubs/FunctionCallStub';
import { FunctionCallArgumentCollectionStub } from '@tests/unit/shared/Stubs/FunctionCallArgumentCollectionStub';
import { createSharedFunctionStubWithCode } from '@tests/unit/shared/Stubs/SharedFunctionStub';
import { FunctionParameterCollectionStub } from '@tests/unit/shared/Stubs/FunctionParameterCollectionStub';
import { SharedFunctionCollectionStub } from '@tests/unit/shared/Stubs/SharedFunctionCollectionStub';
import { itThrowsContextualError } from '@tests/unit/application/Parser/Common/ContextualErrorTester';
import type { ErrorWithContextWrapper } from '@/application/Parser/Common/ContextualError';
import { errorWithContextWrapperStub } from '@tests/unit/shared/Stubs/ErrorWithContextWrapperStub';
import type { FunctionCallArgumentFactory } from '@/application/Parser/Executable/Script/Compiler/Function/Call/Argument/FunctionCallArgument';
import { FunctionCallArgumentFactoryStub } from '@tests/unit/shared/Stubs/FunctionCallArgumentFactoryStub';
import { expectArrayEquals } from '@tests/shared/Assertions/ExpectArrayEquals';

describe('NestedFunctionArgumentCompiler', () => {
  describe('createCompiledNestedCall', () => {
    describe('rethrows error from expressions compiler', () => {
      // arrange
      const expectedInnerError = new Error('child-');
      const parameterName = 'parameterName';
      const expectedErrorMessage = `Error when compiling argument for "${parameterName}"`;
      const nestedCall = new FunctionCallStub()
        .withFunctionName('nested-function-call')
        .withArgumentCollection(new FunctionCallArgumentCollectionStub()
          .withArgument(parameterName, 'unimportant-value'));
      const parentCall = new FunctionCallStub()
        .withFunctionName('parent-function-call');
      const expressionsCompiler = new ExpressionsCompilerStub();
      expressionsCompiler.compileExpressions = () => { throw expectedInnerError; };
      const builder = new NestedFunctionArgumentCompilerBuilder()
        .withParentFunctionCall(parentCall)
        .withNestedFunctionCall(nestedCall)
        .withExpressionsCompiler(expressionsCompiler);
      itThrowsContextualError({
        // act
        throwingAction: (wrapError) => {
          builder
            .withErrorWrapper(wrapError)
            .createCompiledNestedCall();
        },
        // assert
        expectedWrappedError: expectedInnerError,
        expectedContextMessage: expectedErrorMessage,
      });
    });
    describe('compilation', () => {
      describe('without arguments', () => {
        it('matches nested call name', () => {
          // arrange
          const expectedCall = new FunctionCallStub()
            .withArgumentCollection(new FunctionCallArgumentCollectionStub().withEmptyArguments());
          const builder = new NestedFunctionArgumentCompilerBuilder()
            .withNestedFunctionCall(expectedCall);
          // act
          const actualCall = builder.createCompiledNestedCall();
          // assert
          expect(actualCall.functionName).to.equal(expectedCall.functionName);
        });
        it('has no arguments or parameters', () => {
          // arrange
          const expectedCall = new FunctionCallStub()
            .withArgumentCollection(new FunctionCallArgumentCollectionStub().withEmptyArguments());
          const builder = new NestedFunctionArgumentCompilerBuilder()
            .withNestedFunctionCall(expectedCall);
          // act
          const actualCall = builder.createCompiledNestedCall();
          // assert
          expect(actualCall.args.getAllParameterNames()).to.have.lengthOf(0);
        });
        it('does not compile expressions', () => {
          // arrange
          const expressionsCompilerStub = new ExpressionsCompilerStub();
          const call = new FunctionCallStub()
            .withArgumentCollection(new FunctionCallArgumentCollectionStub().withEmptyArguments());
          const builder = new NestedFunctionArgumentCompilerBuilder()
            .withNestedFunctionCall(call)
            .withExpressionsCompiler(expressionsCompilerStub);
          // act
          builder.createCompiledNestedCall();
          // assert
          expect(expressionsCompilerStub.callHistory).to.have.lengthOf(0);
        });
      });
      describe('with arguments', () => {
        it('matches nested call name', () => {
          // arrange
          const expectedName = 'expected-nested-function-call-name';
          const nestedCall = new FunctionCallStub()
            .withFunctionName(expectedName)
            .withArgumentCollection(new FunctionCallArgumentCollectionStub().withSomeArguments());
          const builder = new NestedFunctionArgumentCompilerBuilder()
            .withNestedFunctionCall(nestedCall);
          // act
          const call = builder.createCompiledNestedCall();
          // assert
          expect(call.functionName).to.equal(expectedName);
        });
        it('matches nested call parameters', () => {
          // arrange
          const expectedParameterNames = ['expectedFirstParameterName', 'expectedSecondParameterName'];
          const nestedCall = new FunctionCallStub()
            .withArgumentCollection(new FunctionCallArgumentCollectionStub()
              .withArguments(expectedParameterNames.reduce((acc, name) => ({ ...acc, ...{ [name]: 'unimportant-value' } }), {})));
          const builder = new NestedFunctionArgumentCompilerBuilder()
            .withNestedFunctionCall(nestedCall);
          // act
          const call = builder.createCompiledNestedCall();
          // assert
          const actualParameterNames = call.args.getAllParameterNames();
          expectArrayEquals(actualParameterNames, expectedParameterNames, {
            ignoreOrder: true,
          });
        });
        it('compiles args using parent parameters', () => {
          // arrange
          const expressionsCompilerStub = new ExpressionsCompilerStub();
          const testParameterScenarios = [
            {
              parameterName: 'firstParameterName',
              rawArgumentValue: 'first-raw-argument-value',
              compiledArgumentValue: 'first-compiled-argument-value',
            },
            {
              parameterName: 'secondParameterName',
              rawArgumentValue: 'second-raw-argument-value',
              compiledArgumentValue: 'second-compiled-argument-value',
            },
          ];
          const parentCall = new FunctionCallStub().withArgumentCollection(
            new FunctionCallArgumentCollectionStub().withSomeArguments(),
          );
          testParameterScenarios.forEach(({ rawArgumentValue }) => {
            expressionsCompilerStub.setup({
              givenCode: rawArgumentValue,
              givenArgs: parentCall.args,
              result: testParameterScenarios.find(
                (r) => r.rawArgumentValue === rawArgumentValue,
              )?.compiledArgumentValue ?? 'unexpected arguments',
            });
          });
          const nestedCallArgs = new FunctionCallArgumentCollectionStub()
            .withArguments(testParameterScenarios.reduce((
              acc,
              { parameterName, rawArgumentValue },
            ) => ({ ...acc, ...{ [parameterName]: rawArgumentValue } }), {}));
          const nestedCall = new FunctionCallStub()
            .withArgumentCollection(nestedCallArgs);
          const builder = new NestedFunctionArgumentCompilerBuilder()
            .withExpressionsCompiler(expressionsCompilerStub)
            .withParentFunctionCall(parentCall)
            .withNestedFunctionCall(nestedCall);
          // act
          const compiledCall = builder.createCompiledNestedCall();
          // assert
          const expectedParameterNames = testParameterScenarios.map((p) => p.parameterName);
          const actualParameterNames = compiledCall.args.getAllParameterNames();
          expectArrayEquals(actualParameterNames, expectedParameterNames, {
            ignoreOrder: true,
          });
          const getActualArgumentValue = (parameterName: string) => compiledCall
            .args
            .getArgument(parameterName)
            .argumentValue;
          testParameterScenarios.forEach(({ parameterName, compiledArgumentValue }) => {
            expect(getActualArgumentValue(parameterName)).to.equal(compiledArgumentValue);
          });
        });
        describe('when expression compiler returns empty', () => {
          it('throws for required parameter', () => {
            // arrange
            const parameterName = 'requiredParameter';
            const initialValue = 'initial-value';
            const emptyCompiledExpression = '';
            const expectedError = `Compilation resulted in empty value for required parameter: "${parameterName}"`;
            const nestedCall = new FunctionCallStub()
              .withArgumentCollection(new FunctionCallArgumentCollectionStub()
                .withArgument(parameterName, initialValue));
            const parentCall = new FunctionCallStub().withArgumentCollection(
              new FunctionCallArgumentCollectionStub().withSomeArguments(),
            );
            const context = createContextWithParameter({
              existingFunctionName: nestedCall.functionName,
              existingParameterName: parameterName,
              isExistingParameterOptional: false,
            });
            const expressionsCompilerStub = new ExpressionsCompilerStub()
              .setup({
                givenCode: initialValue,
                givenArgs: parentCall.args,
                result: emptyCompiledExpression,
              });
            const builder = new NestedFunctionArgumentCompilerBuilder()
              .withExpressionsCompiler(expressionsCompilerStub)
              .withParentFunctionCall(parentCall)
              .withContext(context)
              .withNestedFunctionCall(nestedCall);
            // act
            const act = () => builder.createCompiledNestedCall();
            // assert
            expect(act).to.throw(expectedError);
          });
          it('succeeds for optional parameter', () => {
            // arrange
            const parameterName = 'optionalParameter';
            const initialValue = 'initial-value';
            const emptyValue = '';
            const nestedCall = new FunctionCallStub()
              .withArgumentCollection(new FunctionCallArgumentCollectionStub()
                .withArgument(parameterName, initialValue));
            const parentCall = new FunctionCallStub().withArgumentCollection(
              new FunctionCallArgumentCollectionStub().withSomeArguments(),
            );
            const context = createContextWithParameter({
              existingFunctionName: nestedCall.functionName,
              existingParameterName: parameterName,
              isExistingParameterOptional: true,
            });
            const expressionsCompilerStub = new ExpressionsCompilerStub()
              .setup({
                givenCode: initialValue,
                givenArgs: parentCall.args,
                result: emptyValue,
              });
            const builder = new NestedFunctionArgumentCompilerBuilder()
              .withExpressionsCompiler(expressionsCompilerStub)
              .withParentFunctionCall(parentCall)
              .withContext(context)
              .withNestedFunctionCall(nestedCall);
            // act
            const compiledCall = builder.createCompiledNestedCall();
            // assert
            expect(compiledCall.args.hasArgument(parameterName)).toBeFalsy();
          });
        });
      });
    });
  });
});

function createContextWithParameter(options: {
  readonly existingFunctionName: string,
  readonly existingParameterName: string,
  readonly isExistingParameterOptional: boolean,
}): FunctionCallCompilationContext {
  const parameters = new FunctionParameterCollectionStub()
    .withParameterName(options.existingParameterName, options.isExistingParameterOptional);
  const func = createSharedFunctionStubWithCode()
    .withName(options.existingFunctionName)
    .withParameters(parameters);
  const functions = new SharedFunctionCollectionStub()
    .withFunctions(func);
  const context = new FunctionCallCompilationContextStub()
    .withAllFunctions(functions);
  return context;
}

class NestedFunctionArgumentCompilerBuilder implements ArgumentCompiler {
  private expressionsCompiler: IExpressionsCompiler = new ExpressionsCompilerStub();

  private nestedFunctionCall: FunctionCall = new FunctionCallStub();

  private parentFunctionCall: FunctionCall = new FunctionCallStub();

  private context: FunctionCallCompilationContext = new FunctionCallCompilationContextStub();

  private wrapError: ErrorWithContextWrapper = errorWithContextWrapperStub;

  private callArgumentFactory
  : FunctionCallArgumentFactory = new FunctionCallArgumentFactoryStub().factory;

  public withExpressionsCompiler(expressionsCompiler: IExpressionsCompiler): this {
    this.expressionsCompiler = expressionsCompiler;
    return this;
  }

  public withParentFunctionCall(parentFunctionCall: FunctionCall): this {
    this.parentFunctionCall = parentFunctionCall;
    return this;
  }

  public withNestedFunctionCall(nestedFunctionCall: FunctionCall): this {
    this.nestedFunctionCall = nestedFunctionCall;
    return this;
  }

  public withContext(context: FunctionCallCompilationContext): this {
    this.context = context;
    return this;
  }

  public withErrorWrapper(wrapError: ErrorWithContextWrapper): this {
    this.wrapError = wrapError;
    return this;
  }

  public createCompiledNestedCall(): FunctionCall {
    const compiler = new NestedFunctionArgumentCompiler({
      expressionsCompiler: this.expressionsCompiler,
      wrapError: this.wrapError,
      createCallArgument: this.callArgumentFactory,
    });
    return compiler.createCompiledNestedCall(
      this.nestedFunctionCall,
      this.parentFunctionCall,
      this.context,
    );
  }
}
