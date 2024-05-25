import { NodeDataType } from './NodeDataType';
import type { NodeDataErrorContext } from './NodeDataErrorContext';
import type { NodeData } from './NodeData';

export interface NodeContextErrorMessageCreator {
  (
    errorMessage: string,
    context: NodeDataErrorContext,
  ): string;
}

export const createNodeContextErrorMessage: NodeContextErrorMessageCreator = (
  errorMessage,
  context,
) => {
  let message = '';
  if (context.type !== undefined) {
    message += `${NodeDataType[context.type]}: `;
  }
  message += errorMessage;
  message += `\n${getErrorContextDetails(context)}`;
  return message;
};

function getErrorContextDetails(context: NodeDataErrorContext): string {
  let output = `Self: ${printNodeDataAsJson(context.selfNode)}`;
  if (context.parentNode) {
    output += `\nParent: ${printNodeDataAsJson(context.parentNode)}`;
  }
  return output;
}

function printNodeDataAsJson(node: NodeData): string {
  return JSON.stringify(node, undefined, 2);
}
