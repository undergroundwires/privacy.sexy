import { describe, it, expect } from 'vitest';
import { ViteAppMetadata } from '@/infrastructure/Metadata/Vite/ViteAppMetadata';
import packageJson from '@/../package.json' assert { type: 'json' };
import { PropertyKeys } from '@tests/shared/TypeHelpers';

describe('ViteAppMetadata', () => {
  describe('populates from package.json', () => {
    interface ITestCase {
      readonly getActualValue: (sut: ViteAppMetadata) => string;
      readonly expected: string;
    }
    const testCases: { readonly [K in PropertyKeys<ViteAppMetadata>]: ITestCase } = {
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
        const sut = new ViteAppMetadata();

        // act
        const actualValue = getActualValue(sut);

        // assert
        expect(actualValue).toBe(expected);
      });
    });
  });
});
