import { describe, it, expect } from 'vitest';
import packageJson from '@/../package.json' assert { type: 'json' };
import type { PropertyKeys } from '@/TypeHelpers';
import type { IAppMetadata } from '@/infrastructure/EnvironmentVariables/IAppMetadata';
import { ViteEnvironmentVariables } from '@/infrastructure/EnvironmentVariables/Vite/ViteEnvironmentVariables';

describe('ViteEnvironmentVariables', () => {
  describe('populates metadata from package.json', () => {
    interface ITestCase {
      readonly getActualValue: (sut: IAppMetadata) => string;
      readonly expected: string;
    }
    const testCases: { readonly [K in PropertyKeys<IAppMetadata>]: ITestCase } = {
      name: {
        expected: packageJson.name,
        getActualValue: (sut) => sut.name,
      },
      version: {
        expected: packageJson.version,
        getActualValue: (sut) => sut.version,
      },
      slogan: {
        expected: packageJson.slogan,
        getActualValue: (sut) => sut.slogan,
      },
      repositoryUrl: {
        expected: packageJson.repository.url,
        getActualValue: (sut) => sut.repositoryUrl,
      },
      homepageUrl: {
        expected: packageJson.homepage,
        getActualValue: (sut) => sut.homepageUrl,
      },
    };
    Object.entries(testCases).forEach(([propertyName, { expected, getActualValue }]) => {
      it(`should correctly get the value of ${propertyName}`, () => {
        // arrange
        const sut = new ViteEnvironmentVariables();

        // act
        const actualValue = getActualValue(sut);

        // assert
        expect(actualValue).toBe(expected);
      });
    });
  });
});
