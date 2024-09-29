import { isString } from '@/TypeHelpers';
import { createTypeValidator, type TypeValidator } from '../../../Compiler/Common/TypeValidator';
import { type ExecutableErrorContext } from './ExecutableErrorContext';
import { createExecutableContextErrorMessage, type ExecutableContextErrorMessageCreator } from './ExecutableErrorContextMessage';

export interface ExecutableValidatorFactory {
  (context: ExecutableErrorContext): ExecutableValidator;
}

type AssertTypeFunction = (validator: TypeValidator) => void;

export interface ExecutableValidator {
  assertValidName(nameValue: string): void;
  assertType(assert: AssertTypeFunction): void;
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
    private readonly validator: TypeValidator = createTypeValidator(),
  ) {

  }

  public assertValidName(nameValue: string): void {
    this.assert(() => Boolean(nameValue), 'missing name');
    this.assert(
      () => isString(nameValue),
      `Name (${JSON.stringify(nameValue)}) is not a string but ${typeof nameValue}.`,
    );
  }

  public assertType(assert: AssertTypeFunction): void {
    try {
      assert(this.validator);
    } catch (error) {
      this.throw(error.message);
    }
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
