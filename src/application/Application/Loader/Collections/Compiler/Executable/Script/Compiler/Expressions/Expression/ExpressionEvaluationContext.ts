import { PipelineCompiler } from '../Pipes/PipelineCompiler';
import type { IReadOnlyFunctionCallArgumentCollection } from '../../Function/Call/Argument/IFunctionCallArgumentCollection';
import type { IPipelineCompiler } from '../Pipes/IPipelineCompiler';

export interface IExpressionEvaluationContext {
  readonly args: IReadOnlyFunctionCallArgumentCollection;
  readonly pipelineCompiler: IPipelineCompiler;
}

export class ExpressionEvaluationContext implements IExpressionEvaluationContext {
  constructor(
    public readonly args: IReadOnlyFunctionCallArgumentCollection,
    public readonly pipelineCompiler: IPipelineCompiler = new PipelineCompiler(),
  ) {
  }
}
