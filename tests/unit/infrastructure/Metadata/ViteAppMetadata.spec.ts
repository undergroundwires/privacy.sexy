import {
  describe, beforeEach, afterEach, expect,
} from 'vitest';
import { ViteAppMetadata } from '@/infrastructure/Metadata/Vite/ViteAppMetadata';
import { VITE_ENVIRONMENT_KEYS } from '@/infrastructure/Metadata/Vite/ViteEnvironmentKeys';
import { PropertyKeys } from '@/TypeHelpers';

describe('ViteAppMetadata', () => {
  describe('reads values from import.meta.env', () => {
    let originalMetaEnv;
    beforeEach(() => {
      originalMetaEnv = { ...import.meta.env };
    });
    afterEach(() => {
      Object.assign(import.meta.env, originalMetaEnv);
    });

    interface ITestCase {
      readonly getActualValue: (sut: ViteAppMetadata) => string;
      readonly environmentVariable: typeof VITE_ENVIRONMENT_KEYS[
        keyof typeof VITE_ENVIRONMENT_KEYS];
      readonly expected: string;
    }
    const testCases: { [K in PropertyKeys<ViteAppMetadata>]: ITestCase } = {
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
    };
    Object.values(testCases).forEach(({ environmentVariable, expected, getActualValue }) => {
      it(`should correctly get the value of ${environmentVariable}`, () => {
        // arrange
        import.meta.env[environmentVariable] = expected;

        // act
        const sut = new ViteAppMetadata();
        const actualValue = getActualValue(sut);

        // assert
        expect(actualValue).toBe(expected);
      });
    });
  });
});
