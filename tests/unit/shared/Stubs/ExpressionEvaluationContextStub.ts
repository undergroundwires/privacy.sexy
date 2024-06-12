import type { IExpressionEvaluationContext } from '@/application/Parser/Executable/Script/Compiler/Expressions/Expression/ExpressionEvaluationContext';
import type { IPipelineCompiler } from '@/application/Parser/Executable/Script/Compiler/Expressions/Pipes/IPipelineCompiler';
import type { IReadOnlyFunctionCallArgumentCollection } from '@/application/Parser/Executable/Script/Compiler/Function/Call/Argument/IFunctionCallArgumentCollection';
import { FunctionCallArgumentCollectionStub } from './FunctionCallArgumentCollectionStub';
import { PipelineCompilerStub } from './PipelineCompilerStub';

export class ExpressionEvaluationContextStub implements IExpressionEvaluationContext {
  public args: IReadOnlyFunctionCallArgumentCollection = new FunctionCallArgumentCollectionStub()
    .withArgument('test-arg', 'test-value');

  public pipelineCompiler: IPipelineCompiler = new PipelineCompilerStub();

  public withArgs(args: IReadOnlyFunctionCallArgumentCollection) {
    this.args = args;
    return this;
  }

  public withPipelineCompiler(pipelineCompiler: IPipelineCompiler) {
    this.pipelineCompiler = pipelineCompiler;
    return this;
  }
}
