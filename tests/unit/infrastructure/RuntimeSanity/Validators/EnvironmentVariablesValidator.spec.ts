import { describe } from 'vitest';
import { EnvironmentVariablesValidator } from '@/infrastructure/RuntimeSanity/Validators/EnvironmentVariablesValidator';
import { FactoryFunction } from '@/infrastructure/RuntimeSanity/Common/FactoryValidator';
import { EnvironmentVariablesStub } from '@tests/unit/shared/Stubs/EnvironmentVariablesStub';
import { IEnvironmentVariables } from '@/infrastructure/EnvironmentVariables/IEnvironmentVariables';
import { runFactoryValidatorTests } from './FactoryValidatorConcreteTestRunner';

describe('EnvironmentVariablesValidator', () => {
  runFactoryValidatorTests({
    createValidator: (
      factory?: FactoryFunction<IEnvironmentVariables>,
    ) => new EnvironmentVariablesValidator(factory),
    enablingOptionProperty: 'validateEnvironmentVariables',
    factoryFunctionStub: () => new EnvironmentVariablesStub(),
    expectedValidatorName: 'environment variables',
  });
});
