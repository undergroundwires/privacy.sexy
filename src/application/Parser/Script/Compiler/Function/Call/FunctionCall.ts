import { IReadOnlyFunctionCallArgumentCollection } from './Argument/IFunctionCallArgumentCollection';
import { IFunctionCall } from './IFunctionCall';

export class FunctionCall implements IFunctionCall {
  constructor(
    public readonly functionName: string,
    public readonly args: IReadOnlyFunctionCallArgumentCollection,
  ) {
    if (!functionName) {
      throw new Error('missing function name in function call');
    }
    if (!args) {
      throw new Error('missing args');
    }
  }
}
