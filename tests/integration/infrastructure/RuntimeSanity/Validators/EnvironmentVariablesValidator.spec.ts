import { describe } from 'vitest';
import { EnvironmentVariablesValidator } from '@/infrastructure/RuntimeSanity/Validators/EnvironmentVariablesValidator';
import { itNoErrorsOnCurrentEnvironment } from './ValidatorTestRunner';

describe('EnvironmentVariablesValidator', () => {
  itNoErrorsOnCurrentEnvironment(() => new EnvironmentVariablesValidator());
});
