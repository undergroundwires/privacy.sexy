import { describe, it, expect } from 'vitest';
import { CategoryCollectionStub } from '@tests/unit/shared/Stubs/CategoryCollectionStub';
import { ProjectDetailsStub } from '@tests/unit/shared/Stubs/ProjectDetailsStub';
import type { NonEmptyCollectionAssertion, TypeValidator } from '@/application/Common/TypeValidator';
import { TypeValidatorStub } from '@tests/unit/shared/Stubs/TypeValidatorStub';
import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import type { ProjectDetailsLoader } from '@/application/Application/Loader/ProjectDetails/ProjectDetailsLoader';
import { ProjectDetailsLoaderStub } from '@tests/unit/shared/Stubs/ProjectDetailsLoaderStub';
import type { ApplicationFactory } from '@/domain/Application/ApplicationFactory';
import { createApplicationFactorySpy } from '@tests/unit/shared/Stubs/ApplicationFactoryStub';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import { loadApplicationComposite } from '@/application/Application/Loader/CompositeApplicationLoader';
import type { CollectionsLoader } from '@/application/Application/Loader/Collections/CollectionsLoader';
import { CollectionsLoaderStub } from '@tests/unit/shared/Stubs/CollectionsLoaderStub';
import { ApplicationStub } from '@tests/unit/shared/Stubs/ApplicationStub';
import { scrambledEqual } from '@/application/Common/Array';

describe('CompositeApplicationLoader', () => {
  it('returns result from application factory', () => {
    // arrange
    const expectedApplication = new ApplicationStub();
    const factoryStub: ApplicationFactory = () => expectedApplication;
    const context = new TestContext()
      .withApplicationFactory(factoryStub);
    // act
    const actualApplication = context.run();
    // assert
    expect(actualApplication).to.equal(expectedApplication);
  });
  describe('loadApplicationComposite', () => {
    describe('collections', () => {
      it('loads and provides in application instance', () => {
        // arrange
        const { applicationFactory, getInitParameters } = createApplicationFactorySpy();
        const expectedCollections: CategoryCollection[] = [
          new CategoryCollectionStub(),
          new CategoryCollectionStub(),
        ];
        const sut = new TestContext()
          .withApplicationFactory(applicationFactory)
          .withCollectionsLoader(
            new CollectionsLoaderStub()
              .withResult(expectedCollections)
              .stub(),
          );
        // act
        const app = sut.run();
        // assert
        const actualCollections = getInitParameters(app)?.collections;
        expectExists(actualCollections);
        expect(scrambledEqual(expectedCollections, actualCollections)).to.equal(true);
      });
      it('validates loaded collections', () => {
        // arrange
        const data = [new CategoryCollectionStub()];
        const expectedAssertion: NonEmptyCollectionAssertion = {
          value: data,
          valueName: 'Collections',
        };
        const validator = new TypeValidatorStub();
        const sut = new TestContext()
          .withCollectionsLoader(
            new CollectionsLoaderStub()
              .withResult(data)
              .stub(),
          )
          .withTypeValidator(validator);
        // act
        sut.run();
        // assert
        validator.expectNonEmptyCollectionAssertion(expectedAssertion);
      });
    });
    describe('projectDetails', () => {
      it('loads and provides in application instance', () => {
        // arrange
        const { applicationFactory, getInitParameters } = createApplicationFactorySpy();
        const expectedProjectDetails = new ProjectDetailsStub();
        const projectDetailsLoader = new ProjectDetailsLoaderStub()
          .withReturnValue(expectedProjectDetails);
        const context = new TestContext()
          .withApplicationFactory(applicationFactory)
          .withProjectDetailsLoader(projectDetailsLoader.stub());
        // act
        const app = context.run();
        // assert
        const actualProjectDetails = getInitParameters(app)?.projectDetails;
        expect(expectedProjectDetails).to.equal(actualProjectDetails);
      });
      it('uses correctly to load the application', () => {
        // arrange
        const expectedProjectDetails = new ProjectDetailsStub()
          .withName('expected-project-details');
        const projectDetailsLoader = new ProjectDetailsLoaderStub()
          .withReturnValue(expectedProjectDetails);
        const loaderStub = new CollectionsLoaderStub();
        const sut = new TestContext()
          .withProjectDetailsLoader(projectDetailsLoader.stub())
          .withCollectionsLoader(loaderStub.stub());
        // act
        sut.run();
        // assert
        expect(loaderStub.callHistory).to.have.lengthOf(1);
        const [actualProjectDetails] = loaderStub.callHistory[0];
        expect(expectedProjectDetails).to.equal(actualProjectDetails);
      });
    });
  });
});

class TestContext {
  private collectionsLoader
  : CollectionsLoader = new CollectionsLoaderStub().stub();

  private projectDetailsLoader: ProjectDetailsLoader = new ProjectDetailsLoaderStub()
    .stub();

  private typeValidator: TypeValidator = new TypeValidatorStub();

  private applicationFactory: ApplicationFactory = createApplicationFactorySpy().applicationFactory;

  public withApplicationFactory(factory: ApplicationFactory): this {
    this.applicationFactory = factory;
    return this;
  }

  public withCollectionsLoader(
    collectionsLoader: CollectionsLoader,
  ): this {
    this.collectionsLoader = collectionsLoader;
    return this;
  }

  public withProjectDetailsLoader(
    projectDetailsLoader: ProjectDetailsLoader,
  ): this {
    this.projectDetailsLoader = projectDetailsLoader;
    return this;
  }

  public withTypeValidator(validator: TypeValidator): this {
    this.typeValidator = validator;
    return this;
  }

  public run(): ReturnType<typeof loadApplicationComposite> {
    return loadApplicationComposite(
      {
        createApplication: this.applicationFactory,

        loadCollections: this.collectionsLoader,
        loadProjectDetails: this.projectDetailsLoader,

        typeValidator: this.typeValidator,
      },
    );
  }
}
