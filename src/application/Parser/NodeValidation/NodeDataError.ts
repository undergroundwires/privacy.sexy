import { CustomError } from '@/application/Common/CustomError';
import { NodeType } from './NodeType';
import type { NodeData } from './NodeData';

export class NodeDataError extends CustomError {
  constructor(message: string, public readonly context: NodeDataErrorContext) {
    super(createMessage(message, context));
  }
}

export interface NodeDataErrorContext {
  readonly type?: NodeType;
  readonly selfNode: NodeData;
  readonly parentNode?: NodeData;
}

function createMessage(errorMessage: string, context: NodeDataErrorContext) {
  let message = '';
  if (context.type !== undefined) {
    message += `${NodeType[context.type]}: `;
  }
  message += errorMessage;
  message += `\n${dump(context)}`;
  return message;
}

function dump(context: NodeDataErrorContext): string {
  const printJson = (obj: unknown) => JSON.stringify(obj, undefined, 2);
  let output = `Self: ${printJson(context.selfNode)}`;
  if (context.parentNode) {
    output += `\nParent: ${printJson(context.parentNode)}`;
  }
  return output;
}
