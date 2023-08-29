import { describe } from 'vitest';
import { WindowVariablesValidator } from '@/infrastructure/RuntimeSanity/Validators/WindowVariablesValidator';
import { itNoErrorsOnCurrentEnvironment } from './ValidatorTestRunner';

describe('WindowVariablesValidator', () => {
  itNoErrorsOnCurrentEnvironment(() => new WindowVariablesValidator());
});
