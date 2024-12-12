import { describe, it, expect } from 'vitest';
import { parseProjectDetails } from '@/application/Parser/Project/ProjectDetailsParser';
import { AppMetadataStub } from '@tests/unit/shared/Stubs/AppMetadataStub';
import type { PropertyKeys } from '@/TypeHelpers';
import { ProjectDetailsStub } from '@tests/unit/shared/Stubs/ProjectDetailsStub';
import type { ProjectDetails } from '@/domain/Project/ProjectDetails';
import type { ProjectDetailsParameters, ProjectDetailsFactory } from '@/application/Parser/Project/ProjectDetailsFactory';

describe('ProjectDetailsParser', () => {
  describe('parseProjectDetails', () => {
    it('returns expected instance', () => {
      // arrange
      const expectedInformation = new ProjectDetailsStub();
      const factoryMock = () => expectedInformation;
      // act
      const actualInformation = parseProjectDetails(new AppMetadataStub(), factoryMock);
      // assert
      expect(expectedInformation).to.equal(actualInformation);
    });
    describe('default behavior does not throw', () => {
      it('without metadata', () => {
        // arrange
        const metadataFactory = undefined;
        const projectDetailsFactory = createProjectDetailsFactoryStub();
        // act
        const act = () => parseProjectDetails(metadataFactory, projectDetailsFactory);
        // expectS
        expect(act).to.not.throw();
      });
      it('without projectDetailsFactory', () => {
        // arrange
        const metadataFactory = new AppMetadataStub();
        const projectDetailsFactory = undefined;
        // act
        const act = () => parseProjectDetails(metadataFactory, projectDetailsFactory);
        // expect
        expect(act).to.not.throw();
      });
    });
    describe('parses metadata correctly', () => {
      interface MetadataTestScenario {
        readonly setMetadata: (appMetadataStub: AppMetadataStub, value: string) => AppMetadataStub;
        readonly expectedValue: string;
        readonly getActualValue: (projectDetails: ProjectDetails) => string;
      }
      const testScenarios: {
        [K in PropertyKeys<ProjectDetailsParameters>]: MetadataTestScenario
      } = {
        name: {
          setMetadata: (metadata, value) => metadata.witName(value),
          expectedValue: 'expected-app-name',
          getActualValue: (projectDetails) => projectDetails.name,
        },
        version: {
          setMetadata: (metadata, value) => metadata.withVersion(value),
          expectedValue: '0.11.3',
          getActualValue: (projectDetails) => projectDetails.version.toString(),
        },
        slogan: {
          setMetadata: (metadata, value) => metadata.withSlogan(value),
          expectedValue: 'expected-slogan',
          getActualValue: (projectDetails) => projectDetails.slogan,
        },
        repositoryUrl: {
          setMetadata: (metadata, value) => metadata.withRepositoryUrl(value),
          expectedValue: 'https://expected-repository.url',
          getActualValue: (projectDetails) => projectDetails.repositoryUrl,
        },
        homepage: {
          setMetadata: (metadata, value) => metadata.withHomepageUrl(value),
          expectedValue: 'https://expected.sexy',
          getActualValue: (projectDetails) => projectDetails.homepage,
        },
      };
      Object.entries(testScenarios).forEach(([propertyName, {
        expectedValue, setMetadata, getActualValue,
      }]) => {
        it(propertyName, () => {
          // act
          const metadata = setMetadata(new AppMetadataStub(), expectedValue);
          const projectDetailsFactoryStub = createProjectDetailsFactoryStub();
          // act
          const projectDetails = parseProjectDetails(metadata, projectDetailsFactoryStub);
          // assert
          const actual = getActualValue(projectDetails);
          expect(actual).to.be.equal(expectedValue);
        });
      });
    });
  });
});

function createProjectDetailsFactoryStub(): ProjectDetailsFactory {
  return (params) => {
    const details = new ProjectDetailsStub()
      .withName(params.name)
      .withVersion(params.version)
      .withSlogan(params.slogan)
      .withRepositoryUrl(params.repositoryUrl)
      .withHomepageUrl(params.homepage);
    return details;
  };
}
