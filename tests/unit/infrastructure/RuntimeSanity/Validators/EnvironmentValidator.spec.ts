import { describe } from 'vitest';
import { EnvironmentValidator } from '@/infrastructure/RuntimeSanity/Validators/EnvironmentValidator';
import { itNoErrorsOnCurrentEnvironment } from './ValidatorTestRunner';

describe('EnvironmentValidator', () => {
  itNoErrorsOnCurrentEnvironment(() => new EnvironmentValidator());
});
