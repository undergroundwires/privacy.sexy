import { describe, it, expect } from 'vitest';
import { itEachAbsentObjectValue } from '@tests/unit/shared/TestCases/AbsentTests';
import { EnvironmentVariablesStub } from '@tests/unit/shared/Stubs/EnvironmentVariablesStub';
import { validateEnvironmentVariables } from '@/infrastructure/EnvironmentVariables/EnvironmentVariablesValidator';
import { IEnvironmentVariables } from '@/infrastructure/EnvironmentVariables/IEnvironmentVariables';

describe('EnvironmentVariablesValidator', () => {
  it('does not throw if all environment keys have values', () => {
    // arrange
    const environment = new EnvironmentVariablesStub();
    // act
    const act = () => validateEnvironmentVariables(environment);
    // assert
    expect(act).to.not.throw();
  });
  it('does not throw if a boolean key has false value', () => {
    // arrange
    const environmentWithFalseBoolean: Partial<IEnvironmentVariables> = {
      isNonProduction: false,
    };
    const environment: IEnvironmentVariables = {
      ...new EnvironmentVariablesStub(),
      ...environmentWithFalseBoolean,
    };
    // act
    const act = () => validateEnvironmentVariables(environment);
    // assert
    expect(act).to.not.throw();
  });
  describe('throws as expected', () => {
    describe('"missing environment" if environment is not provided', () => {
      itEachAbsentObjectValue((absentValue) => {
        // arrange
        const expectedError = 'missing environment';
        const environment = absentValue;
        // act
        const act = () => validateEnvironmentVariables(environment);
        // assert
        expect(act).to.throw(expectedError);
      });
    });
    it('"missing keys" if environment has properties with missing values', () => {
      // arrange
      const expectedError = 'Environment keys missing: name, homepageUrl';
      const missingData: Partial<IEnvironmentVariables> = {
        name: undefined,
        homepageUrl: undefined,
      };
      const environment: IEnvironmentVariables = {
        ...new EnvironmentVariablesStub(),
        ...missingData,
      };
      // act
      const act = () => validateEnvironmentVariables(environment);
      // assert
      expect(act).to.throw(expectedError);
    });
    it('"missing keys" if environment has getters with missing values', () => {
      // arrange
      const expectedError = 'Environment keys missing: name, homepageUrl';
      const stubWithGetters: Partial<IEnvironmentVariables> = {
        get name() {
          return undefined;
        },
        get homepageUrl() {
          return undefined;
        },
      };
      const environment: IEnvironmentVariables = {
        ...new EnvironmentVariablesStub(),
        ...stubWithGetters,
      };
      // act
      const act = () => validateEnvironmentVariables(environment);
      // assert
      expect(act).to.throw(expectedError);
    });
    it('throws "unable to capture" if environment has no getters or properties', () => {
      // arrange
      const expectedError = 'Unable to capture key/value pairs';
      const environment = {} as IEnvironmentVariables;
      // act
      const act = () => validateEnvironmentVariables(environment);
      // assert
      expect(act).to.throw(expectedError);
    });
  });
});
