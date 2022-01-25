import { IExpressionEvaluationContext } from '@/application/Parser/Script/Compiler/Expressions/Expression/ExpressionEvaluationContext';
import { IPipelineCompiler } from '@/application/Parser/Script/Compiler/Expressions/Pipes/IPipelineCompiler';
import { IReadOnlyFunctionCallArgumentCollection } from '@/application/Parser/Script/Compiler/Function/Call/Argument/IFunctionCallArgumentCollection';
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
