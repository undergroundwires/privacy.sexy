import { CustomError } from '@/application/Common/CustomError';

export interface ErrorWithContextWrapper {
  (
    error: Error,
    additionalContext: string,
  ): Error;
}

export const wrapErrorWithAdditionalContext: ErrorWithContextWrapper = (
  error: Error,
  additionalContext: string,
) => {
  return (error instanceof ContextualError ? error : new ContextualError(error))
    .withAdditionalContext(additionalContext);
};

/* AggregateError is similar but isn't well-serialized or displayed by browsers */
class ContextualError extends CustomError {
  private readonly additionalContext = new Array<string>();

  constructor(
    public readonly innerError: Error,
  ) {
    super();
  }

  public withAdditionalContext(additionalContext: string): this {
    this.additionalContext.push(additionalContext);
    return this;
  }

  public get message(): string { // toString() is not used when Chromium logs it on console
    return [
      '\n',
      this.innerError.message,
      '\n',
      'Additional context:',
      ...this.additionalContext.map((context, index) => `${index + 1}: ${context}`),
    ].join('\n');
  }
}
