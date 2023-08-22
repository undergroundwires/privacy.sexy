import { describe, it, expect } from 'vitest';
import { ExpressionEvaluationContext, IExpressionEvaluationContext } from '@/application/Parser/Script/Compiler/Expressions/Expression/ExpressionEvaluationContext';
import { IReadOnlyFunctionCallArgumentCollection } from '@/application/Parser/Script/Compiler/Function/Call/Argument/IFunctionCallArgumentCollection';
import { IPipelineCompiler } from '@/application/Parser/Script/Compiler/Expressions/Pipes/IPipelineCompiler';
import { FunctionCallArgumentCollectionStub } from '@tests/unit/shared/Stubs/FunctionCallArgumentCollectionStub';
import { PipelineCompilerStub } from '@tests/unit/shared/Stubs/PipelineCompilerStub';
import { itEachAbsentObjectValue } from '@tests/unit/shared/TestCases/AbsentTests';

describe('ExpressionEvaluationContext', () => {
  describe('ctor', () => {
    describe('args', () => {
      describe('throws if args is missing', () => {
        itEachAbsentObjectValue((absentValue) => {
          // arrange
          const expectedError = 'missing args, send empty collection instead.';
          const args = absentValue;
          // act
          const act = () => new ExpressionEvaluationContextBuilder()
            .withArgs(args)
            .build();
          // assert
          expect(act).throw(expectedError);
        });
      });
      it('sets as expected', () => {
        // arrange
        const expected = new FunctionCallArgumentCollectionStub()
          .withArgument('expectedParameter', 'expectedValue');
        const builder = new ExpressionEvaluationContextBuilder()
          .withArgs(expected);
        // act
        const sut = builder.build();
        // assert
        const actual = sut.args;
        expect(actual).to.equal(expected);
      });
    });
    describe('pipelineCompiler', () => {
      it('sets as expected', () => {
        // arrange
        const expected = new PipelineCompilerStub();
        const builder = new ExpressionEvaluationContextBuilder()
          .withPipelineCompiler(expected);
        // act
        const sut = builder.build();
        // assert
        expect(sut.pipelineCompiler).to.equal(expected);
      });
    });
  });
});

class ExpressionEvaluationContextBuilder {
  private args: IReadOnlyFunctionCallArgumentCollection = new FunctionCallArgumentCollectionStub();

  private pipelineCompiler: IPipelineCompiler = new PipelineCompilerStub();

  public withArgs(args: IReadOnlyFunctionCallArgumentCollection) {
    this.args = args;
    return this;
  }

  public withPipelineCompiler(pipelineCompiler: IPipelineCompiler) {
    this.pipelineCompiler = pipelineCompiler;
    return this;
  }

  public build(): IExpressionEvaluationContext {
    return new ExpressionEvaluationContext(this.args, this.pipelineCompiler);
  }
}
