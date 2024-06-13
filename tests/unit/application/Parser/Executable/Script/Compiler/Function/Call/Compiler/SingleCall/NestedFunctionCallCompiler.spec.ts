import { expect, describe, it } from 'vitest';
import { createSharedFunctionStubWithCalls, createSharedFunctionStubWithCode } from '@tests/unit/shared/Stubs/SharedFunctionStub';
import { NestedFunctionCallCompiler } from '@/application/Parser/Executable/Script/Compiler/Function/Call/Compiler/SingleCall/Strategies/NestedFunctionCallCompiler';
import type { ArgumentCompiler } from '@/application/Parser/Executable/Script/Compiler/Function/Call/Compiler/SingleCall/Strategies/Argument/ArgumentCompiler';
import { ArgumentCompilerStub } from '@tests/unit/shared/Stubs/ArgumentCompilerStub';
import { FunctionCallStub } from '@tests/unit/shared/Stubs/FunctionCallStub';
import { FunctionCallCompilationContextStub } from '@tests/unit/shared/Stubs/FunctionCallCompilationContextStub';
import { SingleCallCompilerStub } from '@tests/unit/shared/Stubs/SingleCallCompilerStub';
import { CompiledCodeStub } from '@tests/unit/shared/Stubs/CompiledCodeStub';
import type { FunctionCall } from '@/application/Parser/Executable/Script/Compiler/Function/Call/FunctionCall';
import type { CompiledCode } from '@/application/Parser/Executable/Script/Compiler/Function/Call/Compiler/CompiledCode';
import { itThrowsContextualError } from '@tests/unit/application/Parser/Common/ContextualErrorTester';
import type { ErrorWithContextWrapper } from '@/application/Parser/Common/ContextualError';
import { errorWithContextWrapperStub } from '@tests/unit/shared/Stubs/ErrorWithContextWrapperStub';

describe('NestedFunctionCallCompiler', () => {
  describe('canCompile', () => {
    it('returns `true` for code body function', () => {
      // arrange
      const expected = true;
      const func = createSharedFunctionStubWithCalls()
        .withSomeCalls();
      const compiler = new NestedFunctionCallCompilerBuilder()
        .build();
      // act
      const actual = compiler.canCompile(func);
      // assert
      expect(actual).to.equal(expected);
    });
    it('returns `false` for non-code body function', () => {
      // arrange
      const expected = false;
      const func = createSharedFunctionStubWithCode();
      const compiler = new NestedFunctionCallCompilerBuilder()
        .build();
      // act
      const actual = compiler.canCompile(func);
      // assert
      expect(actual).to.equal(expected);
    });
  });
  describe('compile', () => {
    describe('argument compilation', () => {
      it('uses correct context', () => {
        // arrange
        const argumentCompiler = new ArgumentCompilerStub();
        const expectedContext = new FunctionCallCompilationContextStub();
        const { frontFunction, callToFrontFunc } = createSingleFuncCallingAnotherFunc();
        const compiler = new NestedFunctionCallCompilerBuilder()
          .withArgumentCompiler(argumentCompiler)
          .build();
        // act
        compiler.compileFunction(frontFunction, callToFrontFunc, expectedContext);
        // assert
        const calls = argumentCompiler.callHistory.filter((call) => call.methodName === 'createCompiledNestedCall');
        expect(calls).have.lengthOf(1);
        const [,,actualContext] = calls[0].args;
        expect(actualContext).to.equal(expectedContext);
      });
      it('uses correct parent call', () => {
        // arrange
        const argumentCompiler = new ArgumentCompilerStub();
        const expectedContext = new FunctionCallCompilationContextStub();
        const { frontFunction, callToFrontFunc } = createSingleFuncCallingAnotherFunc();
        const expectedParentCall = callToFrontFunc;
        const compiler = new NestedFunctionCallCompilerBuilder()
          .withArgumentCompiler(argumentCompiler)
          .build();
        // act
        compiler.compileFunction(frontFunction, callToFrontFunc, expectedContext);
        // assert
        const calls = argumentCompiler.callHistory.filter((call) => call.methodName === 'createCompiledNestedCall');
        expect(calls).have.lengthOf(1);
        const [,actualParentCall] = calls[0].args;
        expect(actualParentCall).to.equal(expectedParentCall);
      });
      it('uses correct nested call', () => {
        // arrange
        const argumentCompiler = new ArgumentCompilerStub();
        const expectedContext = new FunctionCallCompilationContextStub();
        const {
          frontFunction, callToDeepFunc, callToFrontFunc,
        } = createSingleFuncCallingAnotherFunc();
        const expectedNestedCall = callToDeepFunc;
        const compiler = new NestedFunctionCallCompilerBuilder()
          .withArgumentCompiler(argumentCompiler)
          .build();
        // act
        compiler.compileFunction(frontFunction, callToFrontFunc, expectedContext);
        // assert
        const calls = argumentCompiler.callHistory.filter((call) => call.methodName === 'createCompiledNestedCall');
        expect(calls).have.lengthOf(1);
        const [actualNestedCall] = calls[0].args;
        expect(actualNestedCall).to.deep.equal(expectedNestedCall);
      });
    });
    describe('re-compilation with compiled args', () => {
      it('uses correct context', () => {
        // arrange
        const singleCallCompilerStub = new SingleCallCompilerStub();
        const expectedContext = new FunctionCallCompilationContextStub()
          .withSingleCallCompiler(singleCallCompilerStub);
        const { frontFunction, callToFrontFunc } = createSingleFuncCallingAnotherFunc();
        const compiler = new NestedFunctionCallCompilerBuilder()
          .build();
        // act
        compiler.compileFunction(frontFunction, callToFrontFunc, expectedContext);
        // assert
        const calls = singleCallCompilerStub.callHistory.filter((call) => call.methodName === 'compileSingleCall');
        expect(calls).have.lengthOf(1);
        const [,actualContext] = calls[0].args;
        expect(expectedContext).to.equal(actualContext);
      });
      it('uses compiled nested call', () => {
        // arrange
        const expectedCall = new FunctionCallStub();
        const argumentCompilerStub = new ArgumentCompilerStub();
        argumentCompilerStub.createCompiledNestedCall = () => expectedCall;
        const singleCallCompilerStub = new SingleCallCompilerStub();
        const context = new FunctionCallCompilationContextStub()
          .withSingleCallCompiler(singleCallCompilerStub);
        const { frontFunction, callToFrontFunc } = createSingleFuncCallingAnotherFunc();
        const compiler = new NestedFunctionCallCompilerBuilder()
          .withArgumentCompiler(argumentCompilerStub)
          .build();
        // act
        compiler.compileFunction(frontFunction, callToFrontFunc, context);
        // assert
        const calls = singleCallCompilerStub.callHistory.filter((call) => call.methodName === 'compileSingleCall');
        expect(calls).have.lengthOf(1);
        const [actualNestedCall] = calls[0].args;
        expect(expectedCall).to.equal(actualNestedCall);
      });
    });
    it('flattens re-compiled functions', () => {
      // arrange
      const deepFunc1 = createSharedFunctionStubWithCode();
      const deepFunc2 = createSharedFunctionStubWithCalls();
      const callToDeepFunc1 = new FunctionCallStub().withFunctionName(deepFunc1.name);
      const callToDeepFunc2 = new FunctionCallStub().withFunctionName(deepFunc2.name);
      const singleCallCompilationScenario = new Map<FunctionCall, CompiledCode[]>([
        [callToDeepFunc1, [new CompiledCodeStub()]],
        [callToDeepFunc2, [new CompiledCodeStub(), new CompiledCodeStub()]],
      ]);
      const argumentCompiler = new ArgumentCompilerStub()
        .withScenario({ givenNestedFunctionCall: callToDeepFunc1, result: callToDeepFunc1 })
        .withScenario({ givenNestedFunctionCall: callToDeepFunc2, result: callToDeepFunc2 });
      const expectedFlattenedCodes = [...singleCallCompilationScenario.values()].flat();
      const frontFunction = createSharedFunctionStubWithCalls()
        .withCalls(callToDeepFunc1, callToDeepFunc2);
      const callToFrontFunc = new FunctionCallStub().withFunctionName(frontFunction.name);
      const singleCallCompilerStub = new SingleCallCompilerStub()
        .withCallCompilationScenarios(singleCallCompilationScenario);
      const expectedContext = new FunctionCallCompilationContextStub()
        .withSingleCallCompiler(singleCallCompilerStub);
      const compiler = new NestedFunctionCallCompilerBuilder()
        .withArgumentCompiler(argumentCompiler)
        .build();
      // act
      const actualCodes = compiler.compileFunction(frontFunction, callToFrontFunc, expectedContext);
      // assert
      expect(actualCodes).have.lengthOf(expectedFlattenedCodes.length);
      expect(actualCodes).to.have.members(expectedFlattenedCodes);
    });
    describe('error handling', () => {
      describe('rethrows error from argument compiler', () => {
        // arrange
        const expectedInnerError = new Error(`Expected error from ${ArgumentCompilerStub.name}`);
        const calleeFunctionName = 'expectedCalleeFunctionName';
        const callerFunctionName = 'expectedCallerFunctionName';
        const expectedErrorMessage = buildRethrowErrorMessage({
          callee: calleeFunctionName,
          caller: callerFunctionName,
        });
        const { frontFunction, callToFrontFunc } = createSingleFuncCallingAnotherFunc({
          frontFunctionName: callerFunctionName,
          deepFunctionName: calleeFunctionName,
        });
        const argumentCompilerStub = new ArgumentCompilerStub();
        argumentCompilerStub.createCompiledNestedCall = () => {
          throw expectedInnerError;
        };
        const builder = new NestedFunctionCallCompilerBuilder()
          .withArgumentCompiler(argumentCompilerStub);
        itThrowsContextualError({
          // act
          throwingAction: (wrapError) => {
            builder
              .withErrorWrapper(wrapError)
              .build()
              .compileFunction(
                frontFunction,
                callToFrontFunc,
                new FunctionCallCompilationContextStub(),
              );
          },
          // assert
          expectedWrappedError: expectedInnerError,
          expectedContextMessage: expectedErrorMessage,
        });
      });
      describe('rethrows error from single call compiler', () => {
        // arrange
        const expectedInnerError = new Error(`Expected error from ${SingleCallCompilerStub.name}`);
        const calleeFunctionName = 'expectedCalleeFunctionName';
        const callerFunctionName = 'expectedCallerFunctionName';
        const expectedErrorMessage = buildRethrowErrorMessage({
          callee: calleeFunctionName,
          caller: callerFunctionName,
        });
        const { frontFunction, callToFrontFunc } = createSingleFuncCallingAnotherFunc({
          frontFunctionName: callerFunctionName,
          deepFunctionName: calleeFunctionName,
        });
        const singleCallCompiler = new SingleCallCompilerStub();
        singleCallCompiler.compileSingleCall = () => {
          throw expectedInnerError;
        };
        const context = new FunctionCallCompilationContextStub()
          .withSingleCallCompiler(singleCallCompiler);
        const builder = new NestedFunctionCallCompilerBuilder();
        itThrowsContextualError({
          // act
          throwingAction: (wrapError) => {
            builder
              .withErrorWrapper(wrapError)
              .build()
              .compileFunction(
                frontFunction,
                callToFrontFunc,
                context,
              );
          },
          // assert
          expectedWrappedError: expectedInnerError,
          expectedContextMessage: expectedErrorMessage,
        });
      });
    });
  });
});

function createSingleFuncCallingAnotherFunc(
  functionNames?: {
    readonly frontFunctionName?: string;
    readonly deepFunctionName?: string;
  },
) {
  const deepFunction = createSharedFunctionStubWithCode()
    .withName(functionNames?.deepFunctionName ?? 'deep-function (is called by front-function)');
  const callToDeepFunc = new FunctionCallStub().withFunctionName(deepFunction.name);
  const frontFunction = createSharedFunctionStubWithCalls()
    .withCalls(callToDeepFunc)
    .withName(functionNames?.frontFunctionName ?? 'front-function (calls deep-function)');
  const callToFrontFunc = new FunctionCallStub().withFunctionName(frontFunction.name);
  return {
    deepFunction,
    frontFunction,
    callToFrontFunc,
    callToDeepFunc,
  };
}

class NestedFunctionCallCompilerBuilder {
  private argumentCompiler: ArgumentCompiler = new ArgumentCompilerStub();

  private wrapError: ErrorWithContextWrapper = errorWithContextWrapperStub;

  public withArgumentCompiler(argumentCompiler: ArgumentCompiler): this {
    this.argumentCompiler = argumentCompiler;
    return this;
  }

  public withErrorWrapper(wrapError: ErrorWithContextWrapper): this {
    this.wrapError = wrapError;
    return this;
  }

  public build(): NestedFunctionCallCompiler {
    return new NestedFunctionCallCompiler(
      this.argumentCompiler,
      this.wrapError,
    );
  }
}

function buildRethrowErrorMessage(
  functionNames: {
    readonly caller: string;
    readonly callee: string;
  },
) {
  return `Failed to call '${functionNames.callee}' (callee function) from '${functionNames.caller}' (caller function).`;
}
