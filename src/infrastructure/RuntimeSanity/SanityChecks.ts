import { EnvironmentVariablesValidator } from './Validators/EnvironmentVariablesValidator';
import type { SanityCheckOptions } from './Common/SanityCheckOptions';
import type { SanityValidator } from './Common/SanityValidator';

const DefaultSanityValidators: SanityValidator[] = [
  new EnvironmentVariablesValidator(),
];

export interface RuntimeSanityValidator {
  (
    options: SanityCheckOptions,
    validators?: readonly SanityValidator[],
  ): void;
}

/* Helps to fail-fast on errors */
export const validateRuntimeSanity: RuntimeSanityValidator = (
  options: SanityCheckOptions,
  validators: readonly SanityValidator[] = DefaultSanityValidators,
) => {
  if (!validators.length) {
    throw new Error('missing validators');
  }
  const errorMessages = validators.reduce((errors, validator) => {
    if (validator.shouldValidate(options)) {
      const errorMessage = getErrorMessage(validator);
      if (errorMessage) {
        errors.push(errorMessage);
      }
    }
    return errors;
  }, new Array<string>());
  if (errorMessages.length > 0) {
    throw new Error(`Sanity check failed.\n${errorMessages.join('\n---\n')}`);
  }
};

function getErrorMessage(validator: SanityValidator): string | undefined {
  const errorMessages = [...validator.collectErrors()];
  if (!errorMessages.length) {
    return undefined;
  }
  return `${validator.name}:\n${errorMessages.join('\n')}`;
}
