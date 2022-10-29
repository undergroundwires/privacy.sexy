import { IFunctionCall } from './Call/IFunctionCall';

import {
  FunctionBodyType, IFunctionCode, ISharedFunction, ISharedFunctionBody,
} from './ISharedFunction';
import { IReadOnlyFunctionParameterCollection } from './Parameter/IFunctionParameterCollection';

export function createCallerFunction(
  name: string,
  parameters: IReadOnlyFunctionParameterCollection,
  callSequence: readonly IFunctionCall[],
): ISharedFunction {
  if (!callSequence || !callSequence.length) {
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
  public readonly body: ISharedFunctionBody;

  constructor(
    public readonly name: string,
    public readonly parameters: IReadOnlyFunctionParameterCollection,
    content: IFunctionCode | readonly IFunctionCall[],
    bodyType: FunctionBodyType,
  ) {
    if (!name) { throw new Error('missing function name'); }
    if (!parameters) { throw new Error('missing parameters'); }
    this.body = {
      type: bodyType,
      code: bodyType === FunctionBodyType.Code ? content as IFunctionCode : undefined,
      calls: bodyType === FunctionBodyType.Calls ? content as readonly IFunctionCall[] : undefined,
    };
  }
}
