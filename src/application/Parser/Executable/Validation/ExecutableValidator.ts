import { isString } from '@/TypeHelpers';
import { createTypeValidator, type TypeValidator } from '../../Common/TypeValidator';
import { type ExecutableErrorContext } from './ExecutableErrorContext';
import { createExecutableContextErrorMessage, type ExecutableContextErrorMessageCreator } from './ExecutableErrorContextMessage';

export interface ExecutableValidatorFactory {
  (context: ExecutableErrorContext): ExecutableValidator;
}

type AssertTypeFunction = (validator: TypeValidator) => void;

export interface ExecutableValidator {
  assertExecutableId(idValue: string): void;
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

  public assertExecutableId(idValue: string) {
    this.assert(() => Boolean(idValue), getMessageWithIdSuggestion('missing ID'));
    this.assert(() => isString(idValue), getMessageWithIdSuggestion(`ID "${idValue}" is not a string but ${typeof idValue}.`));
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

function getMessageWithIdSuggestion(message: string): string {
  return [
    `${message}.`,
    'Suggested resolutions:',
    `\t- Use "${suggestId()}" as ID.`,
    '\t- Run `python3 ./scripts/add_missing_ids.py` to automatically generate missing IDs.'
  ].join('\n');
}

function suggestId(): string {
  const partialGuid = crypto.randomUUID().split('-')[0];
  if (isAllDigits(partialGuid)) {
    return suggestId(); // Numeric-only IDs in YAML without quotes are interpreted as numbers
  }
  return partialGuid;
}

function isAllDigits(text: string): boolean {
  return /^\d+$/.test(text);
}
