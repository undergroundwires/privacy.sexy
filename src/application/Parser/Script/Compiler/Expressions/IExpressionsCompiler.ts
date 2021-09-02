import { IReadOnlyFunctionCallArgumentCollection } from '../FunctionCall/Argument/IFunctionCallArgumentCollection';

export interface IExpressionsCompiler {
    compileExpressions(
        code: string,
        args: IReadOnlyFunctionCallArgumentCollection): string;
}
