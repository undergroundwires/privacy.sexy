import { describe, it, expect } from 'vitest';
import { parseProjectInformation } from '@/application/Parser/ProjectInformationParser';
import { IProjectInformation } from '@/domain/IProjectInformation';
import { AppMetadataStub } from '@tests/unit/shared/Stubs/AppMetadataStub';

describe('ProjectInformationParser', () => {
  describe('parseProjectInformation', () => {
    interface IEnvironmentParsingTestCase {
      readonly testCaseName: string;
      readonly setMetadata: (appMetadataStub: AppMetadataStub, value: string) => AppMetadataStub;
      readonly expectedValue: string;
      readonly getActualValue: (info: IProjectInformation) => string;
    }
    const testCases: readonly IEnvironmentParsingTestCase[] = [
      {
        testCaseName: 'version',
        setMetadata: (metadata, value) => metadata.withVersion(value),
        expectedValue: '0.11.3',
        getActualValue: (info) => info.version.toString(),
      },
      {
        testCaseName: 'name',
        setMetadata: (metadata, value) => metadata.witName(value),
        expectedValue: 'expected-app-name',
        getActualValue: (info) => info.name,
      },
      {
        testCaseName: 'homepage',
        setMetadata: (metadata, value) => metadata.withHomepageUrl(value),
        expectedValue: 'https://expected.sexy',
        getActualValue: (info) => info.homepage,
      },
      {
        testCaseName: 'repositoryUrl',
        setMetadata: (metadata, value) => metadata.withRepositoryUrl(value),
        expectedValue: 'https://expected-repository.url',
        getActualValue: (info) => info.repositoryUrl,
      },
      {
        testCaseName: 'slogan',
        setMetadata: (metadata, value) => metadata.withSlogan(value),
        expectedValue: 'expected-slogan',
        getActualValue: (info) => info.slogan,
      },
    ];
    for (const {
      expectedValue, testCaseName, setMetadata, getActualValue,
    } of testCases) {
      it(testCaseName, () => {
        // act
        const metadata = setMetadata(new AppMetadataStub(), expectedValue);
        // act
        const info = parseProjectInformation(metadata);
        // assert
        const actual = getActualValue(info);
        expect(actual).to.be.equal(expectedValue);
      });
    }
  });
});
