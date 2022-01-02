import { IReadOnlyFunctionCallArgumentCollection } from './Argument/IFunctionCallArgumentCollection';

export interface IFunctionCall {
  readonly functionName: string;
  readonly args: IReadOnlyFunctionCallArgumentCollection;
}
