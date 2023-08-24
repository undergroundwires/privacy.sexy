import { ISanityCheckOptions } from './ISanityCheckOptions';
import { ISanityValidator } from './ISanityValidator';
import { MetadataValidator } from './Validators/MetadataValidator';

const SanityValidators: ISanityValidator[] = [
  new MetadataValidator(),
];

export function validateRuntimeSanity(
  options: ISanityCheckOptions,
  validators: readonly ISanityValidator[] = SanityValidators,
): void {
  if (!options) {
    throw new Error('missing options');
  }
  if (!validators?.length) {
    throw new Error('missing validators');
  }
  const errorMessages = validators.reduce((errors, validator) => {
    if (validator.shouldValidate(options)) {
      errors.push(...validator.collectErrors());
    }
    return errors;
  }, new Array<string>());
  if (errorMessages.length > 0) {
    throw new Error(`Sanity check failed.\n${errorMessages.join('\n---\n')}`);
  }
}
