import { describe, it, expect } from 'vitest';
import { MetadataValidator } from '@/infrastructure/RuntimeSanity/Validators/MetadataValidator';
import { SanityCheckOptionsStub } from '@tests/unit/shared/Stubs/SanityCheckOptionsStub';
import { itEachAbsentObjectValue } from '@tests/unit/shared/TestCases/AbsentTests';
import { AppMetadataStub } from '@tests/unit/shared/Stubs/AppMetadataStub';
import { IAppMetadata } from '@/infrastructure/Metadata/IAppMetadata';

describe('MetadataValidator', () => {
  describe('shouldValidate', () => {
    it('returns true when validateMetadata is true', () => {
      // arrange
      const expectedValue = true;
      const options = new SanityCheckOptionsStub()
        .withValidateMetadata(true);
      const validator = new TestContext()
        .createSut();
      // act
      const actualValue = validator.shouldValidate(options);
      // assert
      expect(actualValue).to.equal(expectedValue);
    });

    it('returns false when validateMetadata is false', () => {
      // arrange
      const expectedValue = false;
      const options = new SanityCheckOptionsStub()
        .withValidateMetadata(false);
      const validator = new TestContext()
        .createSut();
      // act
      const actualValue = validator.shouldValidate(options);
      // assert
      expect(actualValue).to.equal(expectedValue);
    });
  });
  describe('collectErrors', () => {
    describe('yields "missing metadata" if metadata is not provided', () => {
      itEachAbsentObjectValue((absentValue) => {
        // arrange
        const expectedError = 'missing metadata';
        const validator = new TestContext()
          .withMetadata(absentValue)
          .createSut();
        // act
        const errors = [...validator.collectErrors()];
        // assert
        expect(errors).to.have.lengthOf(1);
        expect(errors[0]).to.equal(expectedError);
      });
    });
    it('yields missing keys if metadata has keys without values', () => {
      // arrange
      const expectedError = 'Metadata keys missing: name, homepageUrl';
      const metadata = new AppMetadataStub()
        .witName(undefined)
        .withHomepageUrl(undefined);
      const validator = new TestContext()
        .withMetadata(metadata)
        .createSut();
      // act
      const errors = [...validator.collectErrors()];
      // assert
      expect(errors).to.have.lengthOf(1);
      expect(errors[0]).to.equal(expectedError);
    });
    it('yields missing keys if metadata has getters instead of properties', () => {
      /*
        This test may behave differently in unit testing vs. production due to how code
        is transformed, especially around class getters and their enumerability during bundling.
      */
      // arrange
      const expectedError = 'Metadata keys missing: name, homepageUrl';
      const stubWithGetters: Partial<IAppMetadata> = {
        get name() {
          return undefined;
        },
        get homepageUrl() {
          return undefined;
        },
      };
      const stub: IAppMetadata = {
        ...new AppMetadataStub(),
        ...stubWithGetters,
      };
      const validator = new TestContext()
        .withMetadata(stub)
        .createSut();
      // act
      const errors = [...validator.collectErrors()];
      // assert
      expect(errors).to.have.lengthOf(1);
      expect(errors[0]).to.equal(expectedError);
    });
    it('yields unable to capture metadata if metadata has no getter values', () => {
      // arrange
      const expectedError = 'Unable to capture metadata key/value pairs';
      const stub = {} as IAppMetadata;
      const validator = new TestContext()
        .withMetadata(stub)
        .createSut();
      // act
      const errors = [...validator.collectErrors()];
      // assert
      expect(errors).to.have.lengthOf(1);
      expect(errors[0]).to.equal(expectedError);
    });
    it('does not yield errors if all metadata keys have values', () => {
      // arrange
      const metadata = new AppMetadataStub();
      const validator = new TestContext()
        .withMetadata(metadata)
        .createSut();
      // act
      const errors = [...validator.collectErrors()];
      // assert
      expect(errors).to.have.lengthOf(0);
    });
  });
});

class TestContext {
  public metadata: IAppMetadata = new AppMetadataStub();

  public withMetadata(metadata: IAppMetadata): this {
    this.metadata = metadata;
    return this;
  }

  public createSut(): MetadataValidator {
    const mockFactory = () => this.metadata;
    return new MetadataValidator(mockFactory);
  }
}
