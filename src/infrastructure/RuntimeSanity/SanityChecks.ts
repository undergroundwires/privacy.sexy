import { EnvironmentVariablesValidator } from './Validators/EnvironmentVariablesValidator';
import type { ISanityCheckOptions } from './Common/ISanityCheckOptions';
import type { ISanityValidator } from './Common/ISanityValidator';

const DefaultSanityValidators: ISanityValidator[] = [
  new EnvironmentVariablesValidator(),
];

/* Helps to fail-fast on errors */
export function validateRuntimeSanity(
  options: ISanityCheckOptions,
  validators: readonly ISanityValidator[] = DefaultSanityValidators,
): void {
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
}

function getErrorMessage(validator: ISanityValidator): string | undefined {
  const errorMessages = [...validator.collectErrors()];
  if (!errorMessages.length) {
    return undefined;
  }
  return `${validator.name}:\n${errorMessages.join('\n')}`;
}
