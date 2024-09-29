import { CustomError } from '@/application/Common/CustomError';
import { indentText } from '@/application/Common/Text/IndentText';

export interface ErrorWithContextWrapper {
  (
    innerError: Error,
    additionalContext: string,
  ): Error;
}

export const wrapErrorWithAdditionalContext: ErrorWithContextWrapper = (
  innerError,
  additionalContext,
) => {
  if (!additionalContext) {
    throw new Error('Missing additional context');
  }
  return new ContextualError({
    innerError,
    additionalContext,
  });
};

/**
 * Class for building a detailed error trace.
 *
 * Alternatives considered:
 * - `AggregateError`:
 *   Similar but not well-serialized or displayed by browsers such as Chromium (last tested v126).
 * - `cause` property:
 *   Not displayed by all browsers (last tested v126).
 *   Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause
 *
 * This is immutable where the constructor sets the values because using getter functions such as
 * `get cause()`, `get message()` does not work on Chromium (last tested v126), but works fine on
 * Firefox (last tested v127).
 */
class ContextualError extends CustomError {
  constructor(public readonly context: ErrorContext) {
    super(
      generateDetailedErrorMessageWithContext(context),
      {
        cause: context.innerError,
      },
    );
  }
}

interface ErrorContext {
  readonly innerError: Error;
  readonly additionalContext: string;
}

function generateDetailedErrorMessageWithContext(
  context: ErrorContext,
): string {
  return [
    '\n',
    // Display the current error message first, then the root cause.
    // This prevents repetitive main messages for errors with a `cause:` chain,
    // aligning with browser error display conventions.
    context.additionalContext,
    '\n',
    'Error Trace (starting from root cause):',
    indentText(
      formatErrorTrace(
        // Displaying contexts from the top frame (deepest, most recent) aligns with
        // common debugger/compiler standard.
        extractErrorTraceAscendingFromDeepest(context),
      ),
    ),
    '\n',
  ].join('\n');
}

function extractErrorTraceAscendingFromDeepest(
  context: ErrorContext,
): string[] {
  const originalError = findRootError(context.innerError);
  const contextsDescendingFromMostRecent: string[] = [
    context.additionalContext,
    ...gatherContextsFromErrorChain(context.innerError),
    originalError.toString(),
  ];
  const contextsAscendingFromDeepest = contextsDescendingFromMostRecent.reverse();
  return contextsAscendingFromDeepest;
}

function findRootError(error: Error): Error {
  if (error instanceof ContextualError) {
    return findRootError(error.context.innerError);
  }
  return error;
}

function gatherContextsFromErrorChain(
  error: Error,
  accumulatedContexts: string[] = [],
): string[] {
  if (error instanceof ContextualError) {
    accumulatedContexts.push(error.context.additionalContext);
    return gatherContextsFromErrorChain(error.context.innerError, accumulatedContexts);
  }
  return accumulatedContexts;
}

function formatErrorTrace(
  errorMessages: readonly string[],
): string {
  if (errorMessages.length === 1) {
    return errorMessages[0];
  }
  return errorMessages
    .map((context, index) => `${index + 1}.${indentText(context)}`)
    .join('\n');
}
