import {
  describe, beforeEach, afterEach, expect,
} from 'vitest';
import { VITE_ENVIRONMENT_KEYS } from '@/infrastructure/EnvironmentVariables/Vite/ViteEnvironmentKeys';
import type { PropertyKeys } from '@/TypeHelpers';
import type { IEnvironmentVariables } from '@/infrastructure/EnvironmentVariables/IEnvironmentVariables';
import { ViteEnvironmentVariables } from '@/infrastructure/EnvironmentVariables/Vite/ViteEnvironmentVariables';

describe('ViteEnvironmentVariables', () => {
  describe('reads values from import.meta.env', () => {
    let originalMetaEnv;
    beforeEach(() => {
      originalMetaEnv = { ...import.meta.env };
    });
    afterEach(() => {
      Object.assign(import.meta.env, originalMetaEnv);
    });

    interface ITestCase<T> {
      readonly getActualValue: (sut: IEnvironmentVariables) => T;
      readonly environmentVariable: typeof VITE_ENVIRONMENT_KEYS[
        keyof typeof VITE_ENVIRONMENT_KEYS];
      readonly expected: T;
    }
    const testCases: {
      readonly [K in PropertyKeys<IEnvironmentVariables>]: ITestCase<string | boolean>;
    } = {
      name: {
        environmentVariable: VITE_ENVIRONMENT_KEYS.NAME,
        expected: 'expected-name',
        getActualValue: (sut) => sut.name,
      },
      version: {
        environmentVariable: VITE_ENVIRONMENT_KEYS.VERSION,
        expected: 'expected-version',
        getActualValue: (sut) => sut.version,
      },
      repositoryUrl: {
        environmentVariable: VITE_ENVIRONMENT_KEYS.REPOSITORY_URL,
        expected: 'expected-slogan',
        getActualValue: (sut) => sut.repositoryUrl,
      },
      slogan: {
        environmentVariable: VITE_ENVIRONMENT_KEYS.SLOGAN,
        expected: 'expected-repositoryUrl',
        getActualValue: (sut) => sut.slogan,
      },
      homepageUrl: {
        environmentVariable: VITE_ENVIRONMENT_KEYS.HOMEPAGE_URL,
        expected: 'expected-homepageUrl',
        getActualValue: (sut) => sut.homepageUrl,
      },
      isNonProduction: {
        environmentVariable: VITE_ENVIRONMENT_KEYS.DEV,
        expected: false,
        getActualValue: (sut) => sut.isNonProduction,
      },
    };
    Object.values(testCases).forEach(({ environmentVariable, expected, getActualValue }) => {
      it(`should correctly get the value of ${environmentVariable}`, () => {
        // arrange
        import.meta.env[environmentVariable] = expected;

        // act
        const sut = new ViteEnvironmentVariables();
        const actualValue = getActualValue(sut);

        // assert
        expect(actualValue).toBe(expected);
      });
    });
  });
});
