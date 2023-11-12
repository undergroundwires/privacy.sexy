import { IReadOnlyFunctionCallArgumentCollection } from '../Function/Call/Argument/IFunctionCallArgumentCollection';

export interface IExpressionsCompiler {
  compileExpressions(
    code: string,
    args: IReadOnlyFunctionCallArgumentCollection,
  ): string;
}
