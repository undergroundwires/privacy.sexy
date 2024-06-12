/* eslint-disable max-classes-per-file */
import { describe, it, expect } from 'vitest';
import { FunctionCallSequenceCompiler } from '@/application/Parser/Executable/Script/Compiler/Function/Call/Compiler/FunctionCallSequenceCompiler';
import { itIsSingletonFactory } from '@tests/unit/shared/TestCases/SingletonFactoryTests';
import { itEachAbsentCollectionValue } from '@tests/unit/shared/TestCases/AbsentTests';
import type { SingleCallCompiler } from '@/application/Parser/Executable/Script/Compiler/Function/Call/Compiler/SingleCall/SingleCallCompiler';
import type { CodeSegmentMerger } from '@/application/Parser/Executable/Script/Compiler/Function/Call/Compiler/CodeSegmentJoin/CodeSegmentMerger';
import type { ISharedFunctionCollection } from '@/application/Parser/Executable/Script/Compiler/Function/ISharedFunctionCollection';
import type { FunctionCall } from '@/application/Parser/Executable/Script/Compiler/Function/Call/FunctionCall';
import { FunctionCallStub } from '@tests/unit/shared/Stubs/FunctionCallStub';
import { SharedFunctionCollectionStub } from '@tests/unit/shared/Stubs/SharedFunctionCollectionStub';
import { SingleCallCompilerStub } from '@tests/unit/shared/Stubs/SingleCallCompilerStub';
import { CodeSegmentMergerStub } from '@tests/unit/shared/Stubs/CodeSegmentMergerStub';
import { CompiledCodeStub } from '@tests/unit/shared/Stubs/CompiledCodeStub';
import type { CompiledCode } from '@/application/Parser/Executable/Script/Compiler/Function/Call/Compiler/CompiledCode';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';

describe('FunctionCallSequenceCompiler', () => {
  describe('instance', () => {
    itIsSingletonFactory({
      getter: () => FunctionCallSequenceCompiler.instance,
      expectedType: FunctionCallSequenceCompiler,
    });
  });
  describe('compileFunctionCalls', () => {
    describe('parameter validation', () => {
      describe('calls', () => {
        describe('throws with missing call', () => {
          itEachAbsentCollectionValue<FunctionCall>((absentValue) => {
            // arrange
            const expectedError = 'missing calls';
            const calls = absentValue;
            const builder = new FunctionCallSequenceCompilerBuilder()
              .withCalls(calls);
            // act
            const act = () => builder.compileFunctionCalls();
            // assert
            expect(act).to.throw(expectedError);
          }, { excludeUndefined: true, excludeNull: true });
        });
      });
    });
    describe('invokes single call compiler correctly', () => {
      describe('calls', () => {
        it('with expected call', () => {
          // arrange
          const singleCallCompilerStub = new SingleCallCompilerStub();
          const expectedCall = new FunctionCallStub();
          const builder = new FunctionCallSequenceCompilerBuilder()
            .withSingleCallCompiler(singleCallCompilerStub)
            .withCalls([expectedCall]);
          // act
          builder.compileFunctionCalls();
          // assert
          expect(singleCallCompilerStub.callHistory).to.have.lengthOf(1);
          const calledMethod = singleCallCompilerStub.callHistory.find((m) => m.methodName === 'compileSingleCall');
          expectExists(calledMethod);
          expect(calledMethod.args[0]).to.equal(expectedCall);
        });
        it('with every call', () => {
          // arrange
          const singleCallCompilerStub = new SingleCallCompilerStub();
          const expectedCalls = [
            new FunctionCallStub(), new FunctionCallStub(), new FunctionCallStub(),
          ];
          const builder = new FunctionCallSequenceCompilerBuilder()
            .withSingleCallCompiler(singleCallCompilerStub)
            .withCalls(expectedCalls);
          // act
          builder.compileFunctionCalls();
          // assert
          const calledMethods = singleCallCompilerStub.callHistory.filter((m) => m.methodName === 'compileSingleCall');
          expect(calledMethods).to.have.lengthOf(expectedCalls.length);
          const callArguments = calledMethods.map((c) => c.args[0]);
          expect(expectedCalls).to.have.members(callArguments);
        });
      });
      describe('context', () => {
        it('with expected functions', () => {
          // arrange
          const singleCallCompilerStub = new SingleCallCompilerStub();
          const expectedFunctions = new SharedFunctionCollectionStub();
          const builder = new FunctionCallSequenceCompilerBuilder()
            .withSingleCallCompiler(singleCallCompilerStub)
            .withFunctions(expectedFunctions);
          // act
          builder.compileFunctionCalls();
          // assert
          expect(singleCallCompilerStub.callHistory).to.have.lengthOf(1);
          const calledMethod = singleCallCompilerStub.callHistory.find((m) => m.methodName === 'compileSingleCall');
          expectExists(calledMethod);
          const actualFunctions = calledMethod.args[1].allFunctions;
          expect(actualFunctions).to.equal(expectedFunctions);
        });
        it('with expected call sequence', () => {
          // arrange
          const singleCallCompilerStub = new SingleCallCompilerStub();
          const expectedCallSequence = [new FunctionCallStub(), new FunctionCallStub()];
          const builder = new FunctionCallSequenceCompilerBuilder()
            .withSingleCallCompiler(singleCallCompilerStub)
            .withCalls(expectedCallSequence);
          // act
          builder.compileFunctionCalls();
          // assert
          const calledMethods = singleCallCompilerStub.callHistory.filter((m) => m.methodName === 'compileSingleCall');
          expect(calledMethods).to.have.lengthOf(expectedCallSequence.length);
          const calledSequenceArgs = calledMethods.map((call) => call.args[1].rootCallSequence);
          expect(calledSequenceArgs.every((sequence) => sequence === expectedCallSequence));
        });
        it('with expected call compiler', () => {
          // arrange
          const expectedCompiler = new SingleCallCompilerStub();
          const rootCallSequence = [new FunctionCallStub(), new FunctionCallStub()];
          const builder = new FunctionCallSequenceCompilerBuilder()
            .withCalls(rootCallSequence)
            .withSingleCallCompiler(expectedCompiler);
          // act
          builder.compileFunctionCalls();
          // assert
          const calledMethods = expectedCompiler.callHistory.filter((m) => m.methodName === 'compileSingleCall');
          expect(calledMethods).to.have.lengthOf(rootCallSequence.length);
          const compilerArgs = calledMethods.map((call) => call.args[1].singleCallCompiler);
          expect(compilerArgs.every((compiler) => compiler === expectedCompiler));
        });
      });
    });
    describe('code segment merger', () => {
      it('invokes code segment merger correctly', () => {
        // arrange
        const singleCallCompilationScenario = new Map<FunctionCall, CompiledCode[]>([
          [new FunctionCallStub(), [new CompiledCodeStub()]],
          [new FunctionCallStub(), [new CompiledCodeStub(), new CompiledCodeStub()]],
        ]);
        const expectedFlattenedSegments = [...singleCallCompilationScenario.values()].flat();
        const calls = [...singleCallCompilationScenario.keys()];
        const singleCallCompiler = new SingleCallCompilerStub()
          .withCallCompilationScenarios(singleCallCompilationScenario);
        const codeSegmentMergerStub = new CodeSegmentMergerStub();
        const builder = new FunctionCallSequenceCompilerBuilder()
          .withCalls(calls)
          .withSingleCallCompiler(singleCallCompiler)
          .withCodeSegmentMerger(codeSegmentMergerStub);
        // act
        builder.compileFunctionCalls();
        // assert
        const calledMethod = codeSegmentMergerStub.callHistory.find((c) => c.methodName === 'mergeCodeParts');
        expectExists(calledMethod);
        const [actualSegments] = calledMethod.args;
        expect(expectedFlattenedSegments).to.have.lengthOf(actualSegments.length);
        expect(expectedFlattenedSegments).to.have.deep.members(actualSegments);
      });
      it('returns code segment merger result', () => {
        // arrange
        const expectedResult = new CompiledCodeStub();
        const codeSegmentMergerStub = new CodeSegmentMergerStub();
        codeSegmentMergerStub.mergeCodeParts = () => expectedResult;
        const builder = new FunctionCallSequenceCompilerBuilder()
          .withCodeSegmentMerger(codeSegmentMergerStub);
        // act
        const actualResult = builder.compileFunctionCalls();
        // assert
        expect(actualResult).to.equal(expectedResult);
      });
    });
  });
});

class FunctionCallSequenceCompilerBuilder {
  private singleCallCompiler: SingleCallCompiler = new SingleCallCompilerStub();

  private codeSegmentMerger: CodeSegmentMerger = new CodeSegmentMergerStub();

  private functions: ISharedFunctionCollection = new SharedFunctionCollectionStub();

  private calls: readonly FunctionCall[] = [
    new FunctionCallStub(),
  ];

  public withSingleCallCompiler(compiler: SingleCallCompiler): this {
    this.singleCallCompiler = compiler;
    return this;
  }

  public withCodeSegmentMerger(merger: CodeSegmentMerger): this {
    this.codeSegmentMerger = merger;
    return this;
  }

  public withCalls(calls: readonly FunctionCall[]): this {
    this.calls = calls;
    return this;
  }

  public withFunctions(functions: ISharedFunctionCollection): this {
    this.functions = functions;
    return this;
  }

  public compileFunctionCalls() {
    const compiler = new TestableFunctionCallSequenceCompiler({
      singleCallCompiler: this.singleCallCompiler,
      codeSegmentMerger: this.codeSegmentMerger,
    });
    return compiler.compileFunctionCalls(
      this.calls,
      this.functions,
    );
  }
}

interface FunctionCallSequenceCompilerStubs {
  readonly singleCallCompiler?: SingleCallCompiler;
  readonly codeSegmentMerger: CodeSegmentMerger;
}

class TestableFunctionCallSequenceCompiler extends FunctionCallSequenceCompiler {
  public constructor(options: FunctionCallSequenceCompilerStubs) {
    super(
      options.singleCallCompiler,
      options.codeSegmentMerger,
    );
  }
}
