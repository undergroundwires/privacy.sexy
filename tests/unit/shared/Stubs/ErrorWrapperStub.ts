import type { ErrorWithContextWrapper } from '@/application/Parser/ContextualError';

export class ErrorWrapperStub {
  private errorToReturn: Error | undefined;

  private parameters?: Parameters<ErrorWithContextWrapper>;

  public get lastError(): Error | undefined {
    if (!this.parameters) {
      return undefined;
    }
    return getError(this.parameters);
  }

  public get lastContext(): string | undefined {
    if (!this.parameters) {
      return undefined;
    }
    return getAdditionalContext(this.parameters);
  }

  public withError(error: Error): this {
    this.errorToReturn = error;
    return this;
  }

  public get(): ErrorWithContextWrapper {
    return (...args) => {
      this.parameters = args;
      if (this.errorToReturn) {
        return this.errorToReturn;
      }
      return new Error(
        `[${ErrorWrapperStub.name}] Error wrapped with additional context.`
        + `\nAdditional context: ${getAdditionalContext(args)}`
        + `\nWrapped error message: ${getError(args).message}`
        + `\nWrapped error stack trace:\n${getLimitedStackTrace(getError(args), 5)}`,
      );
    };
  }
}

function getAdditionalContext(
  parameters: Parameters<ErrorWithContextWrapper>,
): string {
  return parameters[1];
}

function getError(
  parameters: Parameters<ErrorWithContextWrapper>,
): Error {
  return parameters[0];
}

function getLimitedStackTrace(
  error: Error,
  limit: number,
): string {
  const { stack } = error;
  if (!stack) {
    return 'No stack trace available';
  }
  return stack
    .split('\n')
    .slice(0, limit + 1)
    .join('\n');
}
