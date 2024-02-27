import { describe, it, expect } from 'vitest';
import type { CollectionData } from '@/application/collections/';
import { parseProjectDetails } from '@/application/Parser/ProjectDetailsParser';
import { type CategoryCollectionParserType, parseApplication } from '@/application/Parser/ApplicationParser';
import type { IAppMetadata } from '@/infrastructure/EnvironmentVariables/IAppMetadata';
import WindowsData from '@/application/collections/windows.yaml';
import MacOsData from '@/application/collections/macos.yaml';
import LinuxData from '@/application/collections/linux.yaml';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { CategoryCollectionStub } from '@tests/unit/shared/Stubs/CategoryCollectionStub';
import { CollectionDataStub } from '@tests/unit/shared/Stubs/CollectionDataStub';
import { getAbsentCollectionTestCases } from '@tests/unit/shared/TestCases/AbsentTests';
import { AppMetadataStub } from '@tests/unit/shared/Stubs/AppMetadataStub';
import { EnvironmentVariablesFactory } from '@/infrastructure/EnvironmentVariables/EnvironmentVariablesFactory';
import { CategoryCollectionParserStub } from '@tests/unit/shared/Stubs/CategoryCollectionParserStub';
import { ProjectDetailsParserStub } from '@tests/unit/shared/Stubs/ProjectDetailsParserStub';
import { ProjectDetailsStub } from '@tests/unit/shared/Stubs/ProjectDetailsStub';

describe('ApplicationParser', () => {
  describe('parseApplication', () => {
    describe('categoryParser', () => {
      it('returns result from the parser', () => {
        // arrange
        const os = OperatingSystem.macOS;
        const data = new CollectionDataStub();
        const expected = new CategoryCollectionStub()
          .withOs(os);
        const parser = new CategoryCollectionParserStub()
          .withReturnValue(data, expected)
          .getStub();
        const sut = new ApplicationParserBuilder()
          .withCategoryCollectionParser(parser)
          .withCollectionsData([data]);
        // act
        const app = sut.parseApplication();
        // assert
        const actual = app.getCollection(os);
        expect(expected).to.equal(actual);
      });
    });
    describe('projectDetails', () => {
      it('projectDetailsParser is used to create the instance', () => {
        // arrange
        const expectedProjectDetails = new ProjectDetailsStub();
        const projectDetailsParserStub = new ProjectDetailsParserStub()
          .withReturnValue(expectedProjectDetails);
        const sut = new ApplicationParserBuilder()
          .withProjectDetailsParser(projectDetailsParserStub.getStub());
        // act
        const app = sut.parseApplication();
        // assert
        const actualProjectDetails = app.projectDetails;
        expect(expectedProjectDetails).to.deep.equal(actualProjectDetails);
      });
      it('projectDetailsParser is used to parse collection', () => {
        // arrange
        const expectedProjectDetails = new ProjectDetailsStub();
        const projectDetailsParserStub = new ProjectDetailsParserStub()
          .withReturnValue(expectedProjectDetails);
        const collectionParserStub = new CategoryCollectionParserStub();
        const sut = new ApplicationParserBuilder()
          .withProjectDetailsParser(projectDetailsParserStub.getStub())
          .withCategoryCollectionParser(collectionParserStub.getStub());
        // act
        sut.parseApplication();
        // assert
        expect(collectionParserStub.arguments).to.have.length.above(0);
        const actuallyUsedInfos = collectionParserStub.arguments.map((arg) => arg.projectDetails);
        expect(actuallyUsedInfos.every(
          (actualProjectDetails) => actualProjectDetails === expectedProjectDetails,
        )).to.equal(true);
      });
    });
    describe('metadata', () => {
      it('used to parse expected metadata', () => {
        // arrange
        const expectedMetadata = new AppMetadataStub();
        const projectDetailsParser = new ProjectDetailsParserStub();
        // act
        new ApplicationParserBuilder()
          .withMetadata(expectedMetadata)
          .withProjectDetailsParser(projectDetailsParser.getStub())
          .parseApplication();
        // assert
        expect(projectDetailsParser.arguments).to.have.lengthOf(1);
        expect(projectDetailsParser.arguments[0]).to.equal(expectedMetadata);
      });
      it('defaults to metadata from factory', () => {
        // arrange
        const expectedMetadata: IAppMetadata = EnvironmentVariablesFactory.Current.instance;
        const projectDetailsParser = new ProjectDetailsParserStub();
        // act
        new ApplicationParserBuilder()
          .withMetadata(undefined) // force using default
          .withProjectDetailsParser(projectDetailsParser.getStub())
          .parseApplication();
        // assert
        expect(projectDetailsParser.arguments).to.have.lengthOf(1);
        expect(projectDetailsParser.arguments[0]).to.equal(expectedMetadata);
      });
    });
    describe('collectionsData', () => {
      describe('set as expected', () => {
        // arrange
        const testCases = [
          {
            name: 'single collection',
            input: [new CollectionDataStub()],
            output: [new CategoryCollectionStub().withOs(OperatingSystem.macOS)],
          },
          {
            name: 'multiple collections',
            input: [
              new CollectionDataStub().withOs('windows'),
              new CollectionDataStub().withOs('macos'),
            ],
            output: [
              new CategoryCollectionStub().withOs(OperatingSystem.macOS),
              new CategoryCollectionStub().withOs(OperatingSystem.Windows),
            ],
          },
        ];
        // act
        for (const testCase of testCases) {
          it(testCase.name, () => {
            let categoryParserStub = new CategoryCollectionParserStub();
            for (let i = 0; i < testCase.input.length; i++) {
              categoryParserStub = categoryParserStub
                .withReturnValue(testCase.input[i], testCase.output[i]);
            }
            const sut = new ApplicationParserBuilder()
              .withCategoryCollectionParser(categoryParserStub.getStub())
              .withCollectionsData(testCase.input);
            // act
            const app = sut.parseApplication();
            // assert
            expect(app.collections).to.deep.equal(testCase.output);
          });
        }
      });
      it('defaults to expected data', () => {
        // arrange
        const expected = [WindowsData, MacOsData, LinuxData];
        const categoryParserStub = new CategoryCollectionParserStub();
        const sut = new ApplicationParserBuilder()
          .withCollectionsData(undefined)
          .withCategoryCollectionParser(categoryParserStub.getStub());
        // act
        sut.parseApplication();
        // assert
        const actual = categoryParserStub.arguments.map((args) => args.data);
        expect(actual).to.deep.equal(expected);
      });
      describe('throws when data is invalid', () => {
        // arrange
        const testCases = [
          ...getAbsentCollectionTestCases<CollectionData>(
            {
              excludeUndefined: true,
              excludeNull: true,
            },
          ).map((testCase) => ({
            name: `given absent collection "${testCase.valueName}"`,
            value: testCase.absentValue,
            expectedError: 'missing collections',
          })),
        ];
        for (const testCase of testCases) {
          it(testCase.name, () => {
            const sut = new ApplicationParserBuilder()
              .withCollectionsData(testCase.value);
            // act
            const act = () => sut.parseApplication();
            // assert
            expect(act).to.throw(testCase.expectedError);
          });
        }
      });
    });
  });
});

class ApplicationParserBuilder {
  private categoryCollectionParser
  : CategoryCollectionParserType = new CategoryCollectionParserStub().getStub();

  private projectDetailsParser
  : typeof parseProjectDetails = new ProjectDetailsParserStub().getStub();

  private metadata: IAppMetadata | undefined = new AppMetadataStub();

  private collectionsData: CollectionData[] | undefined = [new CollectionDataStub()];

  public withCategoryCollectionParser(
    categoryCollectionParser: CategoryCollectionParserType,
  ): this {
    this.categoryCollectionParser = categoryCollectionParser;
    return this;
  }

  public withProjectDetailsParser(
    projectDetailsParser: typeof parseProjectDetails,
  ): this {
    this.projectDetailsParser = projectDetailsParser;
    return this;
  }

  public withMetadata(
    metadata: IAppMetadata | undefined,
  ): this {
    this.metadata = metadata;
    return this;
  }

  public withCollectionsData(collectionsData: CollectionData[] | undefined): this {
    this.collectionsData = collectionsData;
    return this;
  }

  public parseApplication(): ReturnType<typeof parseApplication> {
    return parseApplication(
      this.categoryCollectionParser,
      this.projectDetailsParser,
      this.metadata,
      this.collectionsData,
    );
  }
}
