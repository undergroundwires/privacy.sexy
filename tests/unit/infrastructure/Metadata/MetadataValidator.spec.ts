import { describe, it, expect } from 'vitest';
import { itEachAbsentObjectValue } from '@tests/unit/shared/TestCases/AbsentTests';
import { AppMetadataStub } from '@tests/unit/shared/Stubs/AppMetadataStub';
import { IAppMetadata } from '@/infrastructure/Metadata/IAppMetadata';
import { validateMetadata } from '@/infrastructure/Metadata/MetadataValidator';

describe('MetadataValidator', () => {
  it('does not throw if all metadata keys have values', () => {
    // arrange
    const metadata = new AppMetadataStub();
    // act
    const act = () => validateMetadata(metadata);
    // assert
    expect(act).to.not.throw();
  });
  describe('throws as expected', () => {
    describe('"missing metadata" if metadata is not provided', () => {
      itEachAbsentObjectValue((absentValue) => {
        // arrange
        const expectedError = 'missing metadata';
        const metadata = absentValue;
        // act
        const act = () => validateMetadata(metadata);
        // assert
        expect(act).to.throw(expectedError);
      });
    });
    it('"missing keys" if metadata has properties with missing values', () => {
      // arrange
      const expectedError = 'Metadata keys missing: name, homepageUrl';
      const missingData: Partial<IAppMetadata> = {
        name: undefined,
        homepageUrl: undefined,
      };
      const metadata: IAppMetadata = {
        ...new AppMetadataStub(),
        ...missingData,
      };
      // act
      const act = () => validateMetadata(metadata);
      // assert
      expect(act).to.throw(expectedError);
    });
    it('"missing keys" if metadata has getters with missing values', () => {
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
      const metadata: IAppMetadata = {
        ...new AppMetadataStub(),
        ...stubWithGetters,
      };
      // act
      const act = () => validateMetadata(metadata);
      // assert
      expect(act).to.throw(expectedError);
    });
    it('"unable to capture metadata" if metadata has no getters or properties', () => {
      // arrange
      const expectedError = 'Unable to capture metadata key/value pairs';
      const metadata = {} as IAppMetadata;
      // act
      const act = () => validateMetadata(metadata);
      // assert
      expect(act).to.throw(expectedError);
    });
  });
});
