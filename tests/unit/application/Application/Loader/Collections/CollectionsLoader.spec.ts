import { describe, it, expect } from 'vitest';
import type { CollectionData } from '@/application/collections/';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { CategoryCollectionStub } from '@tests/unit/shared/Stubs/CategoryCollectionStub';
import { CollectionDataStub } from '@tests/unit/shared/Stubs/CollectionDataStub';
import { ProjectDetailsStub } from '@tests/unit/shared/Stubs/ProjectDetailsStub';
import type { CollectionCompiler } from '@/application/Application/Loader/Collections/Compiler/CollectionCompiler';
import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import { loadCollections } from '@/application/Application/Loader/Collections/CollectionsLoader';
import type { ProjectDetails } from '@/domain/Project/ProjectDetails';
import type { CollectionDataProvider } from '@/application/Application/Loader/Collections/DataProvider/CollectionDataProvider';
import { CollectionDataProviderStub } from '@tests/unit/shared/Stubs/CollectionDataProviderStub';
import type { SupportedOperatingSystem } from '@tests/shared/TestCases/SupportedOperatingSystems';
import { expectArrayEquals } from '@tests/shared/Assertions/ExpectArrayEquals';
import { CollectionCompilerStub } from '@tests/unit/shared/Stubs/CategoryCollectionParserStub';

describe('CollectionsLoader', () => {
  describe('loadCollections', () => {
    it('loads all expected collections', () => {
      // arrange
      const collectionNames: Record<SupportedOperatingSystem, string> = {
        [OperatingSystem.macOS]: 'macos',
        [OperatingSystem.Windows]: 'windows',
        [OperatingSystem.Linux]: 'linux',
      };
      const providerStub = new CollectionDataProviderStub();
      const context = new TestContext()
        .withCollectionDataProvider(providerStub.stub());
      // act
      context.run();
      // assert
      const expectedCollectionNames = Object.values(collectionNames);
      const actualCollectionNames = providerStub.callHistory.map((c) => c.collectionName);
      expectArrayEquals(actualCollectionNames, expectedCollectionNames);
    });
    it('parses all loaded collections', () => {
      // arrange
      const loadedCollectionData: Record<SupportedOperatingSystem, CollectionData> = {
        [OperatingSystem.macOS]: new CollectionDataStub().withOs('macos'),
        [OperatingSystem.Windows]: new CollectionDataStub().withOs('windows'),
        [OperatingSystem.Linux]: new CollectionDataStub().withOs('linux'),
      };
      const compiler = new CollectionCompilerStub();
      const expectedData = Object.values(loadedCollectionData);
      const context = new TestContext()
        .withCollectionDataProvider(
          new CollectionDataProviderStub()
            .withSequentialResults(expectedData)
            .stub(),
        )
        .withCollectionCompiler(compiler.stub());
      // act
      context.run();
      // assert
      const actualData = compiler.callHistory.map((a) => a.data);
      expectArrayEquals(actualData, expectedData, {
        ignoreOrder: true,
      });
    });
    it('returns parsed collections', () => {
      // arrange
      const parsedCollectionData: Record<SupportedOperatingSystem, CategoryCollection> = {
        [OperatingSystem.macOS]: new CategoryCollectionStub().withOs(OperatingSystem.macOS),
        [OperatingSystem.Windows]: new CategoryCollectionStub().withOs(OperatingSystem.Windows),
        [OperatingSystem.Linux]: new CategoryCollectionStub().withOs(OperatingSystem.Linux),
      };
      const expectedCollections = Object.values(parsedCollectionData);
      const compiler = new CollectionCompilerStub()
        .withSequentialReturnValues(expectedCollections);
      const context = new TestContext()
        .withCollectionCompiler(compiler.stub());
      // act
      const actualCollections = context.run();
      // expect
      expectArrayEquals(actualCollections, expectedCollections);
    });
    it('provided project details is used to parse collection', () => {
      // arrange
      const expectedProjectDetails = new ProjectDetailsStub();
      const compiler = new CollectionCompilerStub();
      const context = new TestContext()
        .withProjectDetails(expectedProjectDetails)
        .withCollectionCompiler(compiler.stub());
      // act
      context.run();
      // assert
      expect(compiler.callHistory).to.have.length.above(0);
      const actuallyUsedInfos = compiler.callHistory.map((arg) => arg.projectDetails);
      expect(actuallyUsedInfos.every(
        (actualProjectDetails) => actualProjectDetails === expectedProjectDetails,
      )).to.equal(true);
    });
  });
});

class TestContext {
  private collectionCompiler
  : CollectionCompiler = new CollectionCompilerStub().stub();

  private projectDetails: ProjectDetails = new ProjectDetailsStub();

  private collectionDataProvider: CollectionDataProvider = new CollectionDataProviderStub()
    .stub();

  public withCollectionCompiler(
    collectionCompiler: CollectionCompiler,
  ): this {
    this.collectionCompiler = collectionCompiler;
    return this;
  }

  public withProjectDetails(
    projectDetails: ProjectDetails,
  ): this {
    this.projectDetails = projectDetails;
    return this;
  }

  public withCollectionDataProvider(collectionDataProvider: CollectionDataProvider): this {
    this.collectionDataProvider = collectionDataProvider;
    return this;
  }

  public run(): ReturnType<typeof loadCollections> {
    return loadCollections(
      this.projectDetails,
      {
        parseCategoryCollection: this.collectionCompiler,
        loadCollectionFile: this.collectionDataProvider,
      },
    );
  }
}
