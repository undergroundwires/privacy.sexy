/* eslint-disable max-classes-per-file */
import { describe, it, expect } from 'vitest';
import type { CollectionData } from '@/application/collections/';
import { VueAppEnvironment, parseProjectInformation } from '@/application/Parser/ProjectInformationParser';
import { CategoryCollectionParserType, parseApplication } from '@/application/Parser/ApplicationParser';
import WindowsData from '@/application/collections/windows.yaml';
import MacOsData from '@/application/collections/macos.yaml';
import LinuxData from '@/application/collections/linux.yaml';
import { IProjectInformation } from '@/domain/IProjectInformation';
import { ProjectInformation } from '@/domain/ProjectInformation';
import { ICategoryCollection } from '@/domain/ICategoryCollection';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { getEnumValues } from '@/application/Common/Enum';
import { CategoryCollectionStub } from '@tests/unit/shared/Stubs/CategoryCollectionStub';
import { getProcessEnvironmentStub } from '@tests/unit/shared/Stubs/ProcessEnvironmentStub';
import { CollectionDataStub } from '@tests/unit/shared/Stubs/CollectionDataStub';
import { getAbsentCollectionTestCases, AbsentObjectTestCases } from '@tests/unit/shared/TestCases/AbsentTests';

describe('ApplicationParser', () => {
  describe('parseApplication', () => {
    describe('parser', () => {
      it('returns result from the parser', () => {
        // arrange
        const os = OperatingSystem.macOS;
        const data = new CollectionDataStub();
        const expected = new CategoryCollectionStub()
          .withOs(os);
        const parser = new CategoryCollectionParserSpy()
          .setUpReturnValue(data, expected)
          .mockParser();
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
    describe('processEnv', () => {
      it('used to parse expected project information', () => {
        // arrange
        const env = getProcessEnvironmentStub();
        const expected = parseProjectInformation(env);
        const parserSpy = new CategoryCollectionParserSpy();
        const parserMock = parserSpy.mockParser();
        const sut = new ApplicationParserBuilder()
          .withCategoryCollectionParser(parserMock);
        // act
        const app = sut.parseApplication();
        // assert
        expect(expected).to.deep.equal(app.info);
        expect(parserSpy.arguments.map((arg) => arg.info).every((info) => info === expected));
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
            let parserSpy = new CategoryCollectionParserSpy();
            for (let i = 0; i < testCase.input.length; i++) {
              parserSpy = parserSpy.setUpReturnValue(testCase.input[i], testCase.output[i]);
            }
            const sut = new ApplicationParserBuilder()
              .withCategoryCollectionParser(parserSpy.mockParser())
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
        const parserSpy = new CategoryCollectionParserSpy();
        const sut = new ApplicationParserBuilder()
          .withCollectionsData(undefined)
          .withCategoryCollectionParser(parserSpy.mockParser());
        // act
        sut.parseApplication();
        // assert
        const actual = parserSpy.arguments.map((args) => args.data);
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
  private categoryCollectionParser: CategoryCollectionParserType = new CategoryCollectionParserSpy()
    .mockParser();

  private environment: VueAppEnvironment = getProcessEnvironmentStub();

  private collectionsData: CollectionData[] = [new CollectionDataStub()];

  public withCategoryCollectionParser(
    categoryCollectionParser: CategoryCollectionParserType,
  ): this {
    this.categoryCollectionParser = categoryCollectionParser;
    return this;
  }

  public withEnvironment(
    environment: VueAppEnvironment,
  ): this {
    this.environment = environment;
    return this;
  }

  public withCollectionsData(collectionsData: CollectionData[]): this {
    this.collectionsData = collectionsData;
    return this;
  }

  public parseApplication(): ReturnType<typeof parseApplication> {
    return parseApplication(
      this.categoryCollectionParser,
      this.environment,
      this.collectionsData,
    );
  }
}

class CategoryCollectionParserSpy {
  public arguments = new Array<{
    data: CollectionData,
    info: ProjectInformation,
  }>();

  private returnValues = new Map<CollectionData, ICategoryCollection>();

  public setUpReturnValue(
    data: CollectionData,
    collection: ICategoryCollection,
  ): CategoryCollectionParserSpy {
    this.returnValues.set(data, collection);
    return this;
  }

  public mockParser(): CategoryCollectionParserType {
    return (data: CollectionData, info: IProjectInformation) => {
      this.arguments.push({ data, info });
      if (this.returnValues.has(data)) {
        return this.returnValues.get(data);
      }
      // Get next OS with a unique OS so mock does not result in an invalid app due to duplicated OS
      // collections.
      const currentRun = this.arguments.length - 1;
      const nextOs = getEnumValues(OperatingSystem)[currentRun];
      return new CategoryCollectionStub().withOs(nextOs);
    };
  }
}
