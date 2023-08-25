import { describe } from 'vitest';
import { MetadataValidator } from '@/infrastructure/RuntimeSanity/Validators/MetadataValidator';
import { itNoErrorsOnCurrentEnvironment } from './ValidatorTestRunner';

describe('MetadataValidator', () => {
  itNoErrorsOnCurrentEnvironment(() => new MetadataValidator());
});
