import type { PropertyKeys } from '@/TypeHelpers';
import type { FactoryFunction, FactoryValidator } from '@/infrastructure/RuntimeSanity/Common/FactoryValidator';
import type { SanityCheckOptions } from '@/infrastructure/RuntimeSanity/Common/SanityCheckOptions';
import { SanityCheckOptionsStub } from '@tests/unit/shared/Stubs/SanityCheckOptionsStub';

interface TestOptions<T> {
  readonly createValidator: (factory?: FactoryFunction<T>) => FactoryValidator<T>;
  readonly enablingOptionProperty: PropertyKeys<SanityCheckOptions>;
  readonly factoryFunctionStub: FactoryFunction<T>;
  readonly expectedValidatorName: string;
}

export function runFactoryValidatorTests<T>(
  testOptions: TestOptions<T>,
) {
  describe('shouldValidate', () => {
    it('returns true when option is true', () => {
      // arrange
      const expectedValue = true;
      const options: SanityCheckOptions = {
        ...new SanityCheckOptionsStub(),
        [testOptions.enablingOptionProperty]: true,
      };
      const validatorUnderTest = testOptions.createValidator(testOptions.factoryFunctionStub);
      // act
      const actualValue = validatorUnderTest.shouldValidate(options);
      // assert
      expect(actualValue).to.equal(expectedValue);
    });

    it('returns false when option is false', () => {
      // arrange
      const expectedValue = false;
      const options: SanityCheckOptions = {
        ...new SanityCheckOptionsStub(),
        [testOptions.enablingOptionProperty]: false,
      };
      const validatorUnderTest = testOptions.createValidator(testOptions.factoryFunctionStub);
      // act
      const actualValue = validatorUnderTest.shouldValidate(options);
      // assert
      expect(actualValue).to.equal(expectedValue);
    });
  });

  describe('name', () => {
    it('returns as expected', () => {
      // arrange
      const expectedName = testOptions.expectedValidatorName;
      // act
      const validatorUnderTest = testOptions.createValidator(testOptions.factoryFunctionStub);
      // assert
      const actualName = validatorUnderTest.name;
      expect(actualName).to.equal(expectedName);
    });
  });
}
