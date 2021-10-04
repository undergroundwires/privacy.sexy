import { IReadOnlyFunctionCallArgumentCollection } from '../../Function/Call/Argument/IFunctionCallArgumentCollection';
import { IPipelineCompiler } from '../Pipes/IPipelineCompiler';
import { PipelineCompiler } from '../Pipes/PipelineCompiler';

export interface IExpressionEvaluationContext {
    readonly args: IReadOnlyFunctionCallArgumentCollection;
    readonly pipelineCompiler: IPipelineCompiler;
}

export class ExpressionEvaluationContext implements IExpressionEvaluationContext {
    constructor(
        public readonly args: IReadOnlyFunctionCallArgumentCollection,
        public readonly pipelineCompiler: IPipelineCompiler = new PipelineCompiler()) {
        if (!args) {
            throw new Error('undefined args, send empty collection instead');
        }
    }
}
