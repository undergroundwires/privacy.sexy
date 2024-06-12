import { isString } from '@/TypeHelpers';
import type { ExecutableData } from '@/application/collections/';
import { type ExecutableErrorContext } from './ExecutableErrorContext';
import { createExecutableContextErrorMessage, type ExecutableContextErrorMessageCreator } from './ExecutableErrorContextMessage';

export interface ExecutableValidatorFactory {
  (context: ExecutableErrorContext): ExecutableValidator;
}

export interface ExecutableValidator {
  assertValidName(nameValue: string): void;
  assertDefined(
    data: ExecutableData | undefined,
  ): asserts data is NonNullable<ExecutableData> & void;
  assert(
    validationPredicate: () => boolean,
    errorMessage: string,
  ): asserts validationPredicate is (() => true);
  createContextualErrorMessage(errorMessage: string): string;
}

export const createExecutableDataValidator
: ExecutableValidatorFactory = (context) => new ContextualExecutableValidator(context);

export class ContextualExecutableValidator implements ExecutableValidator {
  constructor(
    private readonly context: ExecutableErrorContext,
    private readonly createErrorMessage
    : ExecutableContextErrorMessageCreator = createExecutableContextErrorMessage,
  ) {

  }

  public assertValidName(nameValue: string): void {
    this.assert(() => Boolean(nameValue), 'missing name');
    this.assert(
      () => isString(nameValue),
      `Name (${JSON.stringify(nameValue)}) is not a string but ${typeof nameValue}.`,
    );
  }

  public assertDefined(
    data: ExecutableData,
  ): asserts data is NonNullable<ExecutableData> {
    this.assert(
      () => data !== undefined && data !== null && Object.keys(data).length > 0,
      'missing executable data',
    );
  }

  public assert(
    validationPredicate: () => boolean,
    errorMessage: string,
  ): asserts validationPredicate is (() => true) {
    if (!validationPredicate()) {
      this.throw(errorMessage);
    }
  }

  public createContextualErrorMessage(errorMessage: string): string {
    return this.createErrorMessage(errorMessage, this.context);
  }

  private throw(errorMessage: string): never {
    throw new Error(
      this.createContextualErrorMessage(errorMessage),
    );
  }
}
