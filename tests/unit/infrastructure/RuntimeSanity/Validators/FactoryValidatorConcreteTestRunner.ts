import { PropertyKeys } from '@/TypeHelpers';
import { FactoryFunction, FactoryValidator } from '@/infrastructure/RuntimeSanity/Common/FactoryValidator';
import { ISanityCheckOptions } from '@/infrastructure/RuntimeSanity/Common/ISanityCheckOptions';
import { SanityCheckOptionsStub } from '@tests/unit/shared/Stubs/SanityCheckOptionsStub';

interface ITestOptions<T> {
  createValidator: (factory?: FactoryFunction<T>) => FactoryValidator<T>;
  enablingOptionProperty: PropertyKeys<ISanityCheckOptions>;
  factoryFunctionStub: FactoryFunction<T>;
  expectedValidatorName: string;
}

export function runFactoryValidatorTests<T>(
  testOptions: ITestOptions<T>,
) {
  describe('shouldValidate', () => {
    it('returns true when option is true', () => {
      // arrange
      const expectedValue = true;
      const options: ISanityCheckOptions = {
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
      const options: ISanityCheckOptions = {
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
