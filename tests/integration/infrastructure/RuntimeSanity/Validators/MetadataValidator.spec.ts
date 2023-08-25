import { describe } from 'vitest';
import { MetadataValidator } from '@/infrastructure/RuntimeSanity/Validators/MetadataValidator';
import { FactoryFunction } from '@/infrastructure/RuntimeSanity/Common/FactoryValidator';
import { AppMetadataStub } from '@tests/unit/shared/Stubs/AppMetadataStub';
import { IAppMetadata } from '@/infrastructure/Metadata/IAppMetadata';
import { runFactoryValidatorTests } from './FactoryValidatorConcreteTestRunner';

describe('MetadataValidator', () => {
  runFactoryValidatorTests({
    createValidator: (factory?: FactoryFunction<IAppMetadata>) => new MetadataValidator(factory),
    enablingOptionProperty: 'validateMetadata',
    factoryFunctionStub: () => new AppMetadataStub(),
    expectedValidatorName: 'metadata',
  });
});
