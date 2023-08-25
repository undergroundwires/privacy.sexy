import { ISanityCheckOptions } from './Common/ISanityCheckOptions';
import { ISanityValidator } from './Common/ISanityValidator';
import { MetadataValidator } from './Validators/MetadataValidator';

const DefaultSanityValidators: ISanityValidator[] = [
  new MetadataValidator(),
];

/* Helps to fail-fast on errors */
export function validateRuntimeSanity(
  options: ISanityCheckOptions,
  validators: readonly ISanityValidator[] = DefaultSanityValidators,
): void {
  validateContext(options, validators);
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

function validateContext(
  options: ISanityCheckOptions,
  validators: readonly ISanityValidator[],
) {
  if (!options) {
    throw new Error('missing options');
  }
  if (!validators?.length) {
    throw new Error('missing validators');
  }
  if (validators.some((validator) => !validator)) {
    throw new Error('missing validator in validators');
  }
}

function getErrorMessage(validator: ISanityValidator): string | undefined {
  const errorMessages = [...validator.collectErrors()];
  if (!errorMessages.length) {
    return undefined;
  }
  return `${validator.name}:\n${errorMessages.join('\n')}`;
}
