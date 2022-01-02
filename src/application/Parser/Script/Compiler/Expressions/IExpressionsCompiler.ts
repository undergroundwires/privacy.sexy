import { IReadOnlyFunctionCallArgumentCollection } from '../Function/Call/Argument/IFunctionCallArgumentCollection';

export interface IExpressionsCompiler {
  compileExpressions(
    code: string | undefined,
    args: IReadOnlyFunctionCallArgumentCollection): string;
}
