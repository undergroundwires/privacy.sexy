import type { ExecutableData } from '@/application/collections/';
import { ExecutableType } from './ExecutableType';
import type { ExecutableErrorContext } from './ExecutableErrorContext';

export interface ExecutableContextErrorMessageCreator {
  (
    errorMessage: string,
    context: ExecutableErrorContext,
  ): string;
}

export const createExecutableContextErrorMessage: ExecutableContextErrorMessageCreator = (
  errorMessage,
  context,
) => {
  let message = '';
  if (context.type !== undefined) {
    message += `${ExecutableType[context.type]}: `;
  }
  message += errorMessage;
  message += `\n${getErrorContextDetails(context)}`;
  return message;
};

function getErrorContextDetails(context: ExecutableErrorContext): string {
  let output = `Self: ${printExecutable(context.self)}`;
  if (context.parentCategory) {
    output += `\nParent: ${printExecutable(context.parentCategory)}`;
  }
  return output;
}

function printExecutable(executable: ExecutableData): string {
  return JSON.stringify(executable, undefined, 2);
}
