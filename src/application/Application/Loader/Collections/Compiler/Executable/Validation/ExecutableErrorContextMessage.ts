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
  message += `\n\n${getErrorContextDetails(context)}`;
  return message;
};

function getErrorContextDetails(context: ExecutableErrorContext): string {
  let output = `Executable: ${formatExecutable(context.self)}`;
  if (context.parentCategory) {
    output += `\n\nParent category: ${formatExecutable(context.parentCategory)}`;
  }
  return output;
}

function formatExecutable(executable: ExecutableData): string {
  if (!executable) {
    return 'Executable data is missing.';
  }
  const maxLength = 1000;
  let output = JSON.stringify(executable, undefined, 2);
  if (output.length > maxLength) {
    output = `${output.substring(0, maxLength)}\n... [Rest of the executable trimmed]`;
  }
  return output;
}
