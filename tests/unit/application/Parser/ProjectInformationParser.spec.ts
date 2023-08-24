import { describe, it, expect } from 'vitest';
import { parseProjectInformation, ProjectInformationFactory } from '@/application/Parser/ProjectInformationParser';
import { AppMetadataStub } from '@tests/unit/shared/Stubs/AppMetadataStub';
import { PropertyKeys } from '@/TypeHelpers';
import { ProjectInformationStub } from '@tests/unit/shared/Stubs/ProjectInformationStub';
import { Version } from '@/domain/Version';

describe('ProjectInformationParser', () => {
  describe('parseProjectInformation', () => {
    it('returns expected information', () => {
      // arrange
      const expectedInformation = new ProjectInformationStub();
      const factoryMock = () => expectedInformation;
      // act
      const actualInformation = parseProjectInformation(new AppMetadataStub(), factoryMock);
      // assert
      expect(expectedInformation).to.equal(actualInformation);
    });
    describe('default behavior does not throw', () => {
      it('without metadataFactory', () => {
        // arrange
        const metadataFactory = undefined;
        const informationFactory = new ProjectInformationFactoryStub().getStub();
        // act
        const act = () => parseProjectInformation(metadataFactory, informationFactory);
        // expectS
        expect(act).to.not.throw();
      });
      it('without projectInformationFactory', () => {
        // arrange
        const metadataFactory = new AppMetadataStub();
        const informationFactory = undefined;
        // act
        const act = () => parseProjectInformation(metadataFactory, informationFactory);
        // expect
        expect(act).to.not.throw();
      });
    });
    describe('parses metadata to project information', () => {
      interface IMetadataTestCase {
        readonly setMetadata: (appMetadataStub: AppMetadataStub, value: string) => AppMetadataStub;
        readonly expectedValue: string;
        readonly getActualValue: (info: ProjectInformationFactoryStub) => string;
      }
      const testCases: { [K in PropertyKeys<ProjectInformationFactoryStub>]: IMetadataTestCase } = {
        name: {
          setMetadata: (metadata, value) => metadata.witName(value),
          expectedValue: 'expected-app-name',
          getActualValue: (info) => info.name,
        },
        version: {
          setMetadata: (metadata, value) => metadata.withVersion(value),
          expectedValue: '0.11.3',
          getActualValue: (info) => info.version.toString(),
        },
        slogan: {
          setMetadata: (metadata, value) => metadata.withSlogan(value),
          expectedValue: 'expected-slogan',
          getActualValue: (info) => info.slogan,
        },
        repositoryUrl: {
          setMetadata: (metadata, value) => metadata.withRepositoryUrl(value),
          expectedValue: 'https://expected-repository.url',
          getActualValue: (info) => info.repositoryUrl,
        },
        homepage: {
          setMetadata: (metadata, value) => metadata.withHomepageUrl(value),
          expectedValue: 'https://expected.sexy',
          getActualValue: (info) => info.homepage,
        },
      };
      Object.entries(testCases).forEach(([propertyName, {
        expectedValue, setMetadata, getActualValue,
      }]) => {
        it(propertyName, () => {
          // act
          const metadata = setMetadata(new AppMetadataStub(), expectedValue);
          const factoryStub = new ProjectInformationFactoryStub();
          // act
          parseProjectInformation(metadata, factoryStub.getStub());
          // assert
          const actual = getActualValue(factoryStub);
          expect(actual).to.be.equal(expectedValue);
        });
      });
    });
  });
});

class ProjectInformationFactoryStub {
  public name: string;

  public version: Version;

  public slogan: string;

  public repositoryUrl: string;

  public homepage: string;

  public getStub(): ProjectInformationFactory {
    return (name, version, slogan, repositoryUrl, homepage) => {
      this.name = name;
      this.version = version;
      this.slogan = slogan;
      this.repositoryUrl = repositoryUrl;
      this.homepage = homepage;
      return new ProjectInformationStub();
    };
  }
}
