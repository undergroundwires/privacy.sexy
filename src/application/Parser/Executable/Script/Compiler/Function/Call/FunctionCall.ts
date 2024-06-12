import type { IReadOnlyFunctionCallArgumentCollection } from './Argument/IFunctionCallArgumentCollection';

export interface FunctionCall {
  readonly functionName: string;
  readonly args: IReadOnlyFunctionCallArgumentCollection;
}
