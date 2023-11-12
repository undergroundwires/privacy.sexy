import { expect, describe, it } from 'vitest';
import { ArgumentCompiler } from '@/application/Parser/Script/Compiler/Function/Call/Compiler/SingleCall/Strategies/Argument/ArgumentCompiler';
import { FunctionCallCompilationContext } from '@/application/Parser/Script/Compiler/Function/Call/Compiler/FunctionCallCompilationContext';
import { FunctionCall } from '@/application/Parser/Script/Compiler/Function/Call/FunctionCall';
import { NestedFunctionArgumentCompiler } from '@/application/Parser/Script/Compiler/Function/Call/Compiler/SingleCall/Strategies/Argument/NestedFunctionArgumentCompiler';
import { IExpressionsCompiler } from '@/application/Parser/Script/Compiler/Expressions/IExpressionsCompiler';
import { ExpressionsCompilerStub } from '@tests/unit/shared/Stubs/ExpressionsCompilerStub';
import { FunctionCallCompilationContextStub } from '@tests/unit/shared/Stubs/FunctionCallCompilationContextStub';
import { FunctionCallStub } from '@tests/unit/shared/Stubs/FunctionCallStub';
import { expectDeepThrowsError } from '@tests/shared/Assertions/ExpectDeepThrowsError';
import { FunctionCallArgumentCollectionStub } from '@tests/unit/shared/Stubs/FunctionCallArgumentCollectionStub';
import { createSharedFunctionStubWithCode } from '@tests/unit/shared/Stubs/SharedFunctionStub';
import { FunctionParameterCollectionStub } from '@tests/unit/shared/Stubs/FunctionParameterCollectionStub';
import { SharedFunctionCollectionStub } from '@tests/unit/shared/Stubs/SharedFunctionCollectionStub';

describe('NestedFunctionArgumentCompiler', () => {
  describe('createCompiledNestedCall', () => {
    it('should handle error from expressions compiler', () => {
      // arrange
      const parameterName = 'parameterName';
      const nestedCall = new FunctionCallStub()
        .withFunctionName('nested-function-call')
        .withArgumentCollection(new FunctionCallArgumentCollectionStub()
          .withArgument(parameterName, 'unimportant-value'));
      const parentCall = new FunctionCallStub()
        .withFunctionName('parent-function-call');
      const expressionsCompilerError = new Error('child-');
      const expectedError = new AggregateError(
        [expressionsCompilerError],
        `Error when compiling argument for "${parameterName}"`,
      );
      const expressionsCompiler = new ExpressionsCompilerStub();
      expressionsCompiler.compileExpressions = () => { throw expressionsCompilerError; };
      const builder = new NestedFunctionArgumentCompilerBuilder()
        .withParentFunctionCall(parentCall)
        .withNestedFunctionCall(nestedCall)
        .withExpressionsCompiler(expressionsCompiler);
      // act
      const act = () => builder.createCompiledNestedCall();
      // assert
      expectDeepThrowsError(act, expectedError);
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
          expect(actualParameterNames.length).to.equal(expectedParameterNames.length);
          expect(actualParameterNames).to.have.members(expectedParameterNames);
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
          expect(expectedParameterNames.length).to.equal(actualParameterNames.length);
          expect(expectedParameterNames).to.have.members(actualParameterNames);
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

  public createCompiledNestedCall(): FunctionCall {
    const compiler = new NestedFunctionArgumentCompiler(this.expressionsCompiler);
    return compiler.createCompiledNestedCall(
      this.nestedFunctionCall,
      this.parentFunctionCall,
      this.context,
    );
  }
}
