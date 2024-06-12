import type { FunctionCall } from './FunctionCall';
import type { IReadOnlyFunctionCallArgumentCollection } from './Argument/IFunctionCallArgumentCollection';

export class ParsedFunctionCall implements FunctionCall {
  constructor(
    public readonly functionName: string,
    public readonly args: IReadOnlyFunctionCallArgumentCollection,
  ) {
    if (!functionName) {
      throw new Error('missing function name in function call');
    }
  }
}
