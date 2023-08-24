import { describe, it, expect } from 'vitest';
import type { CollectionData } from '@/application/collections/';
import { parseProjectInformation } from '@/application/Parser/ProjectInformationParser';
import { CategoryCollectionParserType, parseApplication } from '@/application/Parser/ApplicationParser';
import { IAppMetadata } from '@/infrastructure/Metadata/IAppMetadata';
import WindowsData from '@/application/collections/windows.yaml';
import MacOsData from '@/application/collections/macos.yaml';
import LinuxData from '@/application/collections/linux.yaml';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { CategoryCollectionStub } from '@tests/unit/shared/Stubs/CategoryCollectionStub';
import { CollectionDataStub } from '@tests/unit/shared/Stubs/CollectionDataStub';
import { getAbsentCollectionTestCases, AbsentObjectTestCases } from '@tests/unit/shared/TestCases/AbsentTests';
import { AppMetadataStub } from '@tests/unit/shared/Stubs/AppMetadataStub';
import { AppMetadataFactory } from '@/infrastructure/Metadata/AppMetadataFactory';
import { CategoryCollectionParserStub } from '@tests/unit/shared/Stubs/CategoryCollectionParserStub';
import { ProjectInformationParserStub } from '@tests/unit/shared/Stubs/ProjectInformationParserStub';
import { ProjectInformationStub } from '@tests/unit/shared/Stubs/ProjectInformationStub';

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
    describe('project information', () => {
      it('informationParser is used to create application info', () => {
        // arrange
        const expectedInformation = new ProjectInformationStub();
        const informationParserStub = new ProjectInformationParserStub()
          .withReturnValue(expectedInformation);
        const sut = new ApplicationParserBuilder()
          .withProjectInformationParser(informationParserStub.getStub());
        // act
        const app = sut.parseApplication();
        // assert
        const actualInformation = app.info;
        expect(expectedInformation).to.deep.equal(actualInformation);
      });
      it('informationParser is used to parse collection info', () => {
        // arrange
        const expectedInformation = new ProjectInformationStub();
        const informationParserStub = new ProjectInformationParserStub()
          .withReturnValue(expectedInformation);
        const collectionParserStub = new CategoryCollectionParserStub();
        const sut = new ApplicationParserBuilder()
          .withProjectInformationParser(informationParserStub.getStub())
          .withCategoryCollectionParser(collectionParserStub.getStub());
        // act
        sut.parseApplication();
        // assert
        expect(collectionParserStub.arguments).to.have.length.above(0);
        const actualyUsedInfos = collectionParserStub.arguments.map((arg) => arg.info);
        expect(actualyUsedInfos.every((info) => info === expectedInformation));
      });
    });
    describe('metadata', () => {
      it('used to parse expected metadata', () => {
        // arrange
        const expectedMetadata = new AppMetadataStub();
        const infoParserStub = new ProjectInformationParserStub();
        // act
        new ApplicationParserBuilder()
          .withMetadata(expectedMetadata)
          .withProjectInformationParser(infoParserStub.getStub())
          .parseApplication();
        // assert
        expect(infoParserStub.arguments).to.have.lengthOf(1);
        expect(infoParserStub.arguments[0]).to.equal(expectedMetadata);
      });
      it('defaults to metadata from factory', () => {
        // arrange
        const expectedMetadata = AppMetadataFactory.Current;
        const infoParserStub = new ProjectInformationParserStub();
        // act
        new ApplicationParserBuilder()
          .withMetadata(undefined) // force using default
          .withProjectInformationParser(infoParserStub.getStub())
          .parseApplication();
        // assert
        expect(infoParserStub.arguments).to.have.lengthOf(1);
        expect(infoParserStub.arguments[0]).to.equal(expectedMetadata);
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
          ...getAbsentCollectionTestCases<CollectionData>().map((testCase) => ({
            name: `given absent collection "${testCase.valueName}"`,
            value: testCase.absentValue,
            expectedError: 'missing collections',
          })).filter((test) => test.value !== undefined /* the default value is set */),
          ...AbsentObjectTestCases.map((testCase) => ({
            name: `given absent item "${testCase.valueName}"`,
            value: [testCase.absentValue],
            expectedError: 'missing collection provided',
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

  private projectInformationParser
  : typeof parseProjectInformation = new ProjectInformationParserStub().getStub();

  private metadata: IAppMetadata = new AppMetadataStub();

  private collectionsData: CollectionData[] = [new CollectionDataStub()];

  public withCategoryCollectionParser(
    categoryCollectionParser: CategoryCollectionParserType,
  ): this {
    this.categoryCollectionParser = categoryCollectionParser;
    return this;
  }

  public withProjectInformationParser(
    projectInformationParser: typeof parseProjectInformation,
  ): this {
    this.projectInformationParser = projectInformationParser;
    return this;
  }

  public withMetadata(
    environment: IAppMetadata,
  ): this {
    this.metadata = environment;
    return this;
  }

  public withCollectionsData(collectionsData: CollectionData[]): this {
    this.collectionsData = collectionsData;
    return this;
  }

  public parseApplication(): ReturnType<typeof parseApplication> {
    return parseApplication(
      this.categoryCollectionParser,
      this.projectInformationParser,
      this.metadata,
      this.collectionsData,
    );
  }
}
