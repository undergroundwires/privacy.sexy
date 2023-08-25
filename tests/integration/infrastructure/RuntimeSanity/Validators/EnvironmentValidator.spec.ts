import { describe } from 'vitest';
import { EnvironmentValidator } from '@/infrastructure/RuntimeSanity/Validators/EnvironmentValidator';
import { FactoryFunction } from '@/infrastructure/RuntimeSanity/Common/FactoryValidator';
import { EnvironmentStub } from '@tests/unit/shared/Stubs/EnvironmentStub';
import { IEnvironment } from '@/infrastructure/Environment/IEnvironment';
import { runFactoryValidatorTests } from './FactoryValidatorConcreteTestRunner';

describe('EnvironmentValidator', () => {
  runFactoryValidatorTests({
    createValidator: (factory?: FactoryFunction<IEnvironment>) => new EnvironmentValidator(factory),
    enablingOptionProperty: 'validateEnvironment',
    factoryFunctionStub: () => new EnvironmentStub(),
    expectedValidatorName: 'environment',
  });
});
