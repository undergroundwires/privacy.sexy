import { FunctionCall } from './Call/FunctionCall';

import {
  FunctionBodyType, IFunctionCode, ISharedFunction, SharedFunctionBody,
} from './ISharedFunction';
import { IReadOnlyFunctionParameterCollection } from './Parameter/IFunctionParameterCollection';

export function createCallerFunction(
  name: string,
  parameters: IReadOnlyFunctionParameterCollection,
  callSequence: readonly FunctionCall[],
): ISharedFunction {
  if (!callSequence.length) {
    throw new Error(`missing call sequence in function "${name}"`);
  }
  return new SharedFunction(name, parameters, callSequence, FunctionBodyType.Calls);
}

export function createFunctionWithInlineCode(
  name: string,
  parameters: IReadOnlyFunctionParameterCollection,
  code: string,
  revertCode?: string,
): ISharedFunction {
  if (!code) {
    throw new Error(`undefined code in function "${name}"`);
  }
  const content: IFunctionCode = {
    execute: code,
    revert: revertCode,
  };
  return new SharedFunction(name, parameters, content, FunctionBodyType.Code);
}

class SharedFunction implements ISharedFunction {
  public readonly body: SharedFunctionBody;

  constructor(
    public readonly name: string,
    public readonly parameters: IReadOnlyFunctionParameterCollection,
    content: IFunctionCode | readonly FunctionCall[],
    bodyType: FunctionBodyType,
  ) {
    if (!name) { throw new Error('missing function name'); }

    switch (bodyType) {
      case FunctionBodyType.Code:
        this.body = {
          type: FunctionBodyType.Code,
          code: content as IFunctionCode,
        };
        break;
      case FunctionBodyType.Calls:
        this.body = {
          type: FunctionBodyType.Calls,
          calls: content as readonly FunctionCall[],
        };
        break;
      default:
        throw new Error(`unknown body type: ${FunctionBodyType[bodyType]}`);
    }
  }
}
