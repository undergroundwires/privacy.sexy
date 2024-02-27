import type { IReadOnlyFunctionCallArgumentCollection } from '../Function/Call/Argument/IFunctionCallArgumentCollection';

export interface IExpressionsCompiler {
  compileExpressions(
    code: string,
    args: IReadOnlyFunctionCallArgumentCollection,
  ): string;
}
