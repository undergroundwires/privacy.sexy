import { IReadOnlyFunctionCallArgumentCollection } from './Argument/IFunctionCallArgumentCollection';
import { FunctionCall } from './FunctionCall';

export class ParsedFunctionCall implements FunctionCall {
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
