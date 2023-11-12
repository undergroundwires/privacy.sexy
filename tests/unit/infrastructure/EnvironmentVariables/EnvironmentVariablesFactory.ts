import {
  describe,
} from 'vitest';
import { itIsSingleton } from '@tests/unit/shared/TestCases/SingletonTests';
import { EnvironmentVariablesFactory, EnvironmentVariablesValidator } from '@/infrastructure/EnvironmentVariables/EnvironmentVariablesFactory';
import { ViteEnvironmentVariables } from '@/infrastructure/EnvironmentVariables/Vite/ViteEnvironmentVariables';
import { IEnvironmentVariables } from '@/infrastructure/EnvironmentVariables/IEnvironmentVariables';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';

describe('EnvironmentVariablesFactory', () => {
  describe('instance', () => {
    itIsSingleton({
      getter: () => EnvironmentVariablesFactory.Current.instance,
      expectedType: ViteEnvironmentVariables,
    });
  });
  it('creates the correct type', () => {
    // arrange
    const sut = new TestableEnvironmentVariablesFactory();
    // act
    const metadata = sut.instance;
    // assert
    expect(metadata).to.be.instanceOf(ViteEnvironmentVariables);
  });
  it('validates its instance', () => {
    // arrange
    let validatedInstance: IEnvironmentVariables | undefined;
    const validatorMock = (instanceToValidate: IEnvironmentVariables) => {
      validatedInstance = instanceToValidate;
    };
    // act
    const sut = new TestableEnvironmentVariablesFactory(validatorMock);
    const actualInstance = sut.instance;
    // assert
    expectExists(validatedInstance);
    expect(actualInstance).to.equal(validatedInstance);
  });
  it('throws error if validator fails', () => {
    // arrange
    const expectedError = 'validator failed';
    const failingValidator = () => {
      throw new Error(expectedError);
    };
    // act
    const act = () => new TestableEnvironmentVariablesFactory(failingValidator);
    // assert
    expect(act).to.throw(expectedError);
  });
});

class TestableEnvironmentVariablesFactory extends EnvironmentVariablesFactory {
  public constructor(validator: EnvironmentVariablesValidator = () => { /* NO OP */ }) {
    super(validator);
  }
}
