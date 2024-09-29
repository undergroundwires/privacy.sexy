import { describe, it, expect } from 'vitest';
import { loadProjectDetails, type ProjectDetailsFactory } from '@/application/Loader/ProjectDetails/MetadataProjectDetailsLoader';
import { AppMetadataStub } from '@tests/unit/shared/Stubs/AppMetadataStub';
import type { PropertyKeys } from '@/TypeHelpers';
import { ProjectDetailsStub } from '@tests/unit/shared/Stubs/ProjectDetailsStub';
import { Version } from '@/domain/Version';

describe('MetadataProjectDetailsLoader', () => {
  describe('loadProjectDetails', () => {
    it('returns expected instance', () => {
      // arrange
      const expectedInformation = new ProjectDetailsStub();
      const factoryMock = () => expectedInformation;
      // act
      const actualInformation = loadProjectDetails(new AppMetadataStub(), factoryMock);
      // assert
      expect(expectedInformation).to.equal(actualInformation);
    });
    describe('default behavior does not throw', () => {
      it('without metadata', () => {
        // arrange
        const metadataFactory = undefined;
        const projectDetailsFactory = new ProjectDetailsFactoryStub().getStub();
        // act
        const act = () => loadProjectDetails(metadataFactory, projectDetailsFactory);
        // expectS
        expect(act).to.not.throw();
      });
      it('without projectDetailsFactory', () => {
        // arrange
        const metadataFactory = new AppMetadataStub();
        const projectDetailsFactory = undefined;
        // act
        const act = () => loadProjectDetails(metadataFactory, projectDetailsFactory);
        // expect
        expect(act).to.not.throw();
      });
    });
    describe('parses metadata correctly', () => {
      interface MetadataTestScenario {
        readonly setMetadata: (appMetadataStub: AppMetadataStub, value: string) => AppMetadataStub;
        readonly expectedValue: string;
        readonly getActualValue: (projectDetailsFactory: ProjectDetailsFactoryStub) => string;
      }
      const testScenarios: {
        [K in PropertyKeys<ProjectDetailsFactoryStub>]: MetadataTestScenario
      } = {
        name: {
          setMetadata: (metadata, value) => metadata.witName(value),
          expectedValue: 'expected-app-name',
          getActualValue: (projectDetailsFactory) => projectDetailsFactory.name,
        },
        version: {
          setMetadata: (metadata, value) => metadata.withVersion(value),
          expectedValue: '0.11.3',
          getActualValue: (projectDetailsFactory) => projectDetailsFactory.version.toString(),
        },
        slogan: {
          setMetadata: (metadata, value) => metadata.withSlogan(value),
          expectedValue: 'expected-slogan',
          getActualValue: (projectDetailsFactory) => projectDetailsFactory.slogan,
        },
        repositoryUrl: {
          setMetadata: (metadata, value) => metadata.withRepositoryUrl(value),
          expectedValue: 'https://expected-repository.url',
          getActualValue: (projectDetailsFactory) => projectDetailsFactory.repositoryUrl,
        },
        homepage: {
          setMetadata: (metadata, value) => metadata.withHomepageUrl(value),
          expectedValue: 'https://expected.sexy',
          getActualValue: (projectDetailsFactory) => projectDetailsFactory.homepage,
        },
      };
      Object.entries(testScenarios).forEach(([propertyName, {
        expectedValue, setMetadata, getActualValue,
      }]) => {
        it(propertyName, () => {
          // act
          const metadata = setMetadata(new AppMetadataStub(), expectedValue);
          const projectDetailsFactoryStub = new ProjectDetailsFactoryStub();
          // act
          loadProjectDetails(metadata, projectDetailsFactoryStub.getStub());
          // assert
          const actual = getActualValue(projectDetailsFactoryStub);
          expect(actual).to.be.equal(expectedValue);
        });
      });
    });
  });
});

class ProjectDetailsFactoryStub {
  public name: string;

  public version: Version;

  public slogan: string;

  public repositoryUrl: string;

  public homepage: string;

  public getStub(): ProjectDetailsFactory {
    return (name, version, slogan, repositoryUrl, homepage) => {
      this.name = name;
      this.version = version;
      this.slogan = slogan;
      this.repositoryUrl = repositoryUrl;
      this.homepage = homepage;
      return new ProjectDetailsStub();
    };
  }
}
