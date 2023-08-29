import { describe } from 'vitest';
import { WindowVariablesValidator } from '@/infrastructure/RuntimeSanity/Validators/WindowVariablesValidator';
import { FactoryFunction } from '@/infrastructure/RuntimeSanity/Common/FactoryValidator';
import { WindowVariables } from '@/infrastructure/WindowVariables/WindowVariables';
import { WindowVariablesStub } from '@tests/unit/shared/Stubs/WindowVariablesStub';
import { runFactoryValidatorTests } from './FactoryValidatorConcreteTestRunner';

describe('WindowVariablesValidator', () => {
  runFactoryValidatorTests({
    createValidator: (
      factory?: FactoryFunction<WindowVariables>,
    ) => new WindowVariablesValidator(factory),
    enablingOptionProperty: 'validateWindowVariables',
    factoryFunctionStub: () => new WindowVariablesStub(),
    expectedValidatorName: 'window variables',
  });
});
