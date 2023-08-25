import {
  describe,
} from 'vitest';
import { itIsSingleton } from '@tests/unit/shared/TestCases/SingletonTests';
import { AppMetadataFactory, MetadataValidator } from '@/infrastructure/Metadata/AppMetadataFactory';
import { ViteAppMetadata } from '@/infrastructure/Metadata/Vite/ViteAppMetadata';
import { IAppMetadata } from '@/infrastructure/Metadata/IAppMetadata';

class TestableAppMetadataFactory extends AppMetadataFactory {
  public constructor(validator: MetadataValidator = () => { /* NO OP */ }) {
    super(validator);
  }
}

describe('AppMetadataFactory', () => {
  describe('instance', () => {
    itIsSingleton({
      getter: () => AppMetadataFactory.Current.instance,
      expectedType: ViteAppMetadata,
    });
  });
  it('creates the correct type of metadata', () => {
    // arrange
    const sut = new TestableAppMetadataFactory();
    // act
    const metadata = sut.instance;
    // assert
    expect(metadata).to.be.instanceOf(ViteAppMetadata);
  });
  it('validates its instance', () => {
    // arrange
    let validatedMetadata: IAppMetadata;
    const validatorMock = (metadata: IAppMetadata) => {
      validatedMetadata = metadata;
    };
    // act
    const sut = new TestableAppMetadataFactory(validatorMock);
    const actualInstance = sut.instance;
    // assert
    expect(actualInstance).to.equal(validatedMetadata);
  });
  it('throws error if validator fails', () => {
    // arrange
    const expectedError = 'validator failed';
    const failingValidator = () => {
      throw new Error(expectedError);
    };
    // act
    const act = () => new TestableAppMetadataFactory(failingValidator);
    // assert
    expect(act).to.throw(expectedError);
  });
});
