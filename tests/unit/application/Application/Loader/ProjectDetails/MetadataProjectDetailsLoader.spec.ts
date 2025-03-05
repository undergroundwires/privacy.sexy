import { describe, it, expect } from 'vitest';
import { AppMetadataStub } from '@tests/unit/shared/Stubs/AppMetadataStub';
import type { PropertyKeys } from '@/TypeHelpers';
import { ProjectDetailsStub } from '@tests/unit/shared/Stubs/ProjectDetailsStub';
import type { ProjectDetails } from '@/domain/Project/ProjectDetails';
import type { ProjectDetailsParameters, ProjectDetailsFactory } from '@/application/Application/Loader/ProjectDetails/ProjectDetailsFactory';
import { loadProjectDetailsFromMetadata } from '@/application/Application/Loader/ProjectDetails/MetadataProjectDetailsLoader';
import { createProjectDetailsFactoryStub } from '@tests/unit/shared/Stubs/ProjectDetailsFactoryStub';
import type { IAppMetadata } from '@/infrastructure/EnvironmentVariables/IAppMetadata';

describe('MetadataProjectDetailsLoader', () => {
  describe('loadProjectDetailsFromMetadata', () => {
    it('returns expected instance', () => {
      // arrange
      const expectedInformation = new ProjectDetailsStub();
      const factoryMock: ProjectDetailsFactory = () => expectedInformation;
      const context = new TestContext()
        .withProjectDetailsFactory(factoryMock);
      // act
      const actualInformation = context.load();
      // assert
      expect(expectedInformation).to.equal(actualInformation);
    });
    describe('default behavior does not throw', () => {
      it('without metadata', () => {
        // arrange
        const appMetadata = undefined;
        const context = new TestContext()
          .withAppMetadata(appMetadata);
        // act
        const act = () => context.load();
        // expectS
        expect(act).to.not.throw();
      });
      it('without projectDetailsFactory', () => {
        // arrange
        const appMetadata = new AppMetadataStub();
        const context = new TestContext()
          .withAppMetadata(appMetadata);
        // act
        const act = () => context.load();
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
          const context = new TestContext()
            .withAppMetadata(metadata);
          // act
          const projectDetails = context.load();
          // assert
          const actual = getActualValue(projectDetails);
          expect(actual).to.be.equal(expectedValue);
        });
      });
    });
  });
});

class TestContext {
  private projectDetailsFactory: ProjectDetailsFactory
  | undefined = createProjectDetailsFactoryStub();

  private appMetadata: IAppMetadata | undefined = new AppMetadataStub();

  public withProjectDetailsFactory(factory: ProjectDetailsFactory | undefined): this {
    this.projectDetailsFactory = factory;
    return this;
  }

  public withAppMetadata(metadata: IAppMetadata | undefined): this {
    this.appMetadata = metadata;
    return this;
  }

  public load(): ReturnType<typeof loadProjectDetailsFromMetadata> {
    return loadProjectDetailsFromMetadata(
      this.appMetadata,
      this.projectDetailsFactory,
    );
  }
}
