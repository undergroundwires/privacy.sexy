import { expect, describe, it } from 'vitest';
import { createSharedFunctionStubWithCode } from '@tests/unit/shared/Stubs/SharedFunctionStub';
import type { FunctionCallParametersData } from '@/application/collections/';
import { FunctionCallStub } from '@tests/unit/shared/Stubs/FunctionCallStub';
import { SharedFunctionCollectionStub } from '@tests/unit/shared/Stubs/SharedFunctionCollectionStub';
import { AdaptiveFunctionCallCompiler } from '@/application/Parser/Script/Compiler/Function/Call/Compiler/SingleCall/AdaptiveFunctionCallCompiler';
import type { SingleCallCompilerStrategy } from '@/application/Parser/Script/Compiler/Function/Call/Compiler/SingleCall/SingleCallCompilerStrategy';
import { SingleCallCompilerStrategyStub } from '@tests/unit/shared/Stubs/SingleCallCompilerStrategyStub';
import type { FunctionCall } from '@/application/Parser/Script/Compiler/Function/Call/FunctionCall';
import type { FunctionCallCompilationContext } from '@/application/Parser/Script/Compiler/Function/Call/Compiler/FunctionCallCompilationContext';
import { FunctionCallCompilationContextStub } from '@tests/unit/shared/Stubs/FunctionCallCompilationContextStub';
import { CompiledCodeStub } from '@tests/unit/shared/Stubs/CompiledCodeStub';
import type { SingleCallCompiler } from '@/application/Parser/Script/Compiler/Function/Call/Compiler/SingleCall/SingleCallCompiler';
import { collectExceptionMessage } from '@tests/unit/shared/ExceptionCollector';

describe('AdaptiveFunctionCallCompiler', () => {
  describe('compileSingleCall', () => {
    describe('throws if call parameters does not match function parameters', () => {
      // arrange
      const functionName = 'test-function-name';
      const testCases: Array<{
        readonly description: string,
        readonly functionParameters: string[],
        readonly callParameters: string[]
        readonly expectedError: string;
      }> = [
        {
          description: 'provided: single unexpected parameter, when: another expected',
          functionParameters: ['expected-parameter'],
          callParameters: ['unexpected-parameter'],
          expectedError:
            `Function "${functionName}" has unexpected parameter(s) provided: "unexpected-parameter".`
            + '\nExpected parameter(s): "expected-parameter"',
        },
        {
          description: 'provided: multiple unexpected parameters, when: different one is expected',
          functionParameters: ['expected-parameter'],
          callParameters: ['unexpected-parameter1', 'unexpected-parameter2'],
          expectedError:
            `Function "${functionName}" has unexpected parameter(s) provided: "unexpected-parameter1", "unexpected-parameter2".`
            + '\nExpected parameter(s): "expected-parameter"',
        },
        {
          description: 'provided: an unexpected parameter, when: multiple parameters are expected',
          functionParameters: ['expected-parameter1', 'expected-parameter2'],
          callParameters: ['expected-parameter1', 'expected-parameter2', 'unexpected-parameter'],
          expectedError:
            `Function "${functionName}" has unexpected parameter(s) provided: "unexpected-parameter".`
            + '\nExpected parameter(s): "expected-parameter1", "expected-parameter2"',
        },
        {
          description: 'provided: an unexpected parameter, when: none required',
          functionParameters: [],
          callParameters: ['unexpected-call-parameter'],
          expectedError:
            `Function "${functionName}" has unexpected parameter(s) provided: "unexpected-call-parameter".`
            + '\nExpected parameter(s): none',
        },
        {
          description: 'provided: expected and unexpected parameter, when: one of them is expected',
          functionParameters: ['expected-parameter'],
          callParameters: ['expected-parameter', 'unexpected-parameter'],
          expectedError:
            `Function "${functionName}" has unexpected parameter(s) provided: "unexpected-parameter".`
            + '\nExpected parameter(s): "expected-parameter"',
        },
      ];
      testCases.forEach(({
        description, functionParameters, callParameters, expectedError,
      }) => {
        it(description, () => {
          // arrange
          const func = createSharedFunctionStubWithCode()
            .withName('test-function-name')
            .withParameterNames(...functionParameters);
          const params = callParameters
            .reduce((result, parameter) => {
              return { ...result, [parameter]: 'defined-parameter-value' };
            }, {} as FunctionCallParametersData);
          const call = new FunctionCallStub()
            .withFunctionName(func.name)
            .withArguments(params);
          const builder = new AdaptiveFunctionCallCompilerBuilder()
            .withContext(new FunctionCallCompilationContextStub()
              .withAllFunctions(
                new SharedFunctionCollectionStub().withFunctions(func),
              ))
            .withCall(call);
          // act
          const act = () => builder.compileSingleCall();
          // assert
          const errorMessage = collectExceptionMessage(act);
          expect(errorMessage).to.include(expectedError);
        });
      });
    });
    describe('strategy selection', () => {
      it('uses the matching strategy among multiple', () => {
        // arrange
        const matchedStrategy = new SingleCallCompilerStrategyStub()
          .withCanCompileResult(true);
        const unmatchedStrategy = new SingleCallCompilerStrategyStub()
          .withCanCompileResult(false);
        const builder = new AdaptiveFunctionCallCompilerBuilder()
          .withStrategies([matchedStrategy, unmatchedStrategy]);
        // act
        builder.compileSingleCall();
        // assert
        expect(matchedStrategy.callHistory.filter((c) => c.methodName === 'compileFunction')).to.have.lengthOf(1);
        expect(unmatchedStrategy.callHistory.filter((c) => c.methodName === 'compileFunction')).to.have.lengthOf(0);
      });
      it('throws if multiple strategies can compile', () => {
        // arrange
        const expectedError = 'Multiple strategies found to compile the function call.';
        const matchedStrategy1 = new SingleCallCompilerStrategyStub().withCanCompileResult(true);
        const matchedStrategy2 = new SingleCallCompilerStrategyStub().withCanCompileResult(true);
        const builder = new AdaptiveFunctionCallCompilerBuilder().withStrategies(
          [matchedStrategy1, matchedStrategy2],
        );
        // act
        const act = () => builder.compileSingleCall();
        // assert
        expect(act).to.throw(expectedError);
      });
      it('throws if no strategy can compile', () => {
        // arrange
        const expectedError = 'No strategies found to compile the function call.';
        const unmatchedStrategy = new SingleCallCompilerStrategyStub()
          .withCanCompileResult(false);
        const builder = new AdaptiveFunctionCallCompilerBuilder()
          .withStrategies([unmatchedStrategy]);
        // act
        const act = () => builder.compileSingleCall();
        // assert
        expect(act).to.throw(expectedError);
      });
    });
    describe('strategy invocation', () => {
      it('passes correct function for compilation ability check', () => {
        // arrange
        const expectedFunction = createSharedFunctionStubWithCode();
        const strategy = new SingleCallCompilerStrategyStub()
          .withCanCompileResult(true);
        const builder = new AdaptiveFunctionCallCompilerBuilder()
          .withContext(new FunctionCallCompilationContextStub()
            .withAllFunctions(
              new SharedFunctionCollectionStub().withFunctions(expectedFunction),
            ))
          .withCall(new FunctionCallStub().withFunctionName(expectedFunction.name))
          .withStrategies([strategy]);
        // act
        builder.compileSingleCall();
        // assert
        const call = strategy.callHistory.filter((c) => c.methodName === 'canCompile');
        expect(call).to.have.lengthOf(1);
        expect(call[0].args[0]).to.equal(expectedFunction);
      });
      describe('compilation arguments', () => {
        it('uses correct function', () => {
          // arrange
          const expectedFunction = createSharedFunctionStubWithCode();
          const strategy = new SingleCallCompilerStrategyStub()
            .withCanCompileResult(true);
          const builder = new AdaptiveFunctionCallCompilerBuilder()
            .withContext(new FunctionCallCompilationContextStub()
              .withAllFunctions(
                new SharedFunctionCollectionStub().withFunctions(expectedFunction),
              ))
            .withCall(new FunctionCallStub().withFunctionName(expectedFunction.name))
            .withStrategies([strategy]);
          // act
          builder.compileSingleCall();
          // assert
          const call = strategy.callHistory.filter((c) => c.methodName === 'compileFunction');
          expect(call).to.have.lengthOf(1);
          const [actualFunction] = call[0].args;
          expect(actualFunction).to.equal(expectedFunction);
        });
        it('uses correct call', () => {
          // arrange
          const expectedCall = new FunctionCallStub();
          const strategy = new SingleCallCompilerStrategyStub()
            .withCanCompileResult(true);
          const builder = new AdaptiveFunctionCallCompilerBuilder()
            .withStrategies([strategy])
            .withCall(expectedCall);
          // act
          builder.compileSingleCall();
          // assert
          const call = strategy.callHistory.filter((c) => c.methodName === 'compileFunction');
          expect(call).to.have.lengthOf(1);
          const [,actualCall] = call[0].args;
          expect(actualCall).to.equal(expectedCall);
        });
        it('uses correct context', () => {
          // arrange
          const expectedContext = new FunctionCallCompilationContextStub();
          const strategy = new SingleCallCompilerStrategyStub()
            .withCanCompileResult(true);
          const builder = new AdaptiveFunctionCallCompilerBuilder()
            .withStrategies([strategy])
            .withContext(expectedContext);
          // act
          builder.compileSingleCall();
          // assert
          const call = strategy.callHistory.filter((c) => c.methodName === 'compileFunction');
          expect(call).to.have.lengthOf(1);
          const [,,actualContext] = call[0].args;
          expect(actualContext).to.equal(expectedContext);
        });
      });
    });
    it('returns compiled code from strategy', () => {
      // arrange
      const expectedResult = [new CompiledCodeStub(), new CompiledCodeStub()];
      const strategy = new SingleCallCompilerStrategyStub()
        .withCanCompileResult(true)
        .withCompiledFunctionResult(expectedResult);
      const builder = new AdaptiveFunctionCallCompilerBuilder()
        .withStrategies([strategy]);
      // act
      const actualResult = builder.compileSingleCall();
      // assert
      expect(expectedResult).to.equal(actualResult);
    });
  });
});

class AdaptiveFunctionCallCompilerBuilder implements SingleCallCompiler {
  private strategies: SingleCallCompilerStrategy[] = [
    new SingleCallCompilerStrategyStub().withCanCompileResult(true),
  ];

  private call: FunctionCall = new FunctionCallStub();

  private context: FunctionCallCompilationContext = new FunctionCallCompilationContextStub();

  public withCall(call: FunctionCall): this {
    this.call = call;
    return this;
  }

  public withContext(context: FunctionCallCompilationContext): this {
    this.context = context;
    return this;
  }

  public withStrategies(strategies: SingleCallCompilerStrategy[]): this {
    this.strategies = strategies;
    return this;
  }

  public compileSingleCall() {
    const compiler = new AdaptiveFunctionCallCompiler(this.strategies);
    return compiler.compileSingleCall(
      this.call,
      this.context,
    );
  }
}
