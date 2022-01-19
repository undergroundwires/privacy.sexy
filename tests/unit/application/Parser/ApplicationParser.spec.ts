import 'mocha';
import { expect } from 'chai';
import { CollectionData } from 'js-yaml-loader!@/*';
import { parseProjectInformation } from '@/application/Parser/ProjectInformationParser';
import { CategoryCollectionParserType, parseApplication } from '@/application/Parser/ApplicationParser';
import WindowsData from 'js-yaml-loader!@/application/collections/windows.yaml';
import MacOsData from 'js-yaml-loader!@/application/collections/macos.yaml';
import { IProjectInformation } from '@/domain/IProjectInformation';
import { ProjectInformation } from '@/domain/ProjectInformation';
import { ICategoryCollection } from '@/domain/ICategoryCollection';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { getEnumValues } from '@/application/Common/Enum';
import { CategoryCollectionStub } from '@tests/unit/stubs/CategoryCollectionStub';
import { getProcessEnvironmentStub } from '@tests/unit/stubs/ProcessEnvironmentStub';
import { CollectionDataStub } from '@tests/unit/stubs/CollectionDataStub';

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
        const env = getProcessEnvironmentStub();
        const collections = [data];
        // act
        const app = parseApplication(parser, env, collections);
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
        // act
        const app = parseApplication(parserMock, env);
        // assert
        expect(expected).to.deep.equal(app.info);
        expect(parserSpy.arguments.map((arg) => arg.info).every((info) => info === expected));
      });
      it('defaults to process.env', () => {
        // arrange
        const { env } = process;
        const expected = parseProjectInformation(env);
        const parserSpy = new CategoryCollectionParserSpy();
        const parserMock = parserSpy.mockParser();
        // act
        const app = parseApplication(parserMock);
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
            const env = getProcessEnvironmentStub();
            let parserSpy = new CategoryCollectionParserSpy();
            for (let i = 0; i < testCase.input.length; i++) {
              parserSpy = parserSpy.setUpReturnValue(testCase.input[i], testCase.output[i]);
            }
            const parserMock = parserSpy.mockParser();
            // act
            const app = parseApplication(parserMock, env, testCase.input);
            // assert
            expect(app.collections).to.deep.equal(testCase.output);
          });
        }
      });
      it('defaults to expected data', () => {
        // arrange
        const expected = [WindowsData, MacOsData];
        const parserSpy = new CategoryCollectionParserSpy();
        const parserMock = parserSpy.mockParser();
        // act
        parseApplication(parserMock);
        // assert
        const actual = parserSpy.arguments.map((args) => args.data);
        expect(actual).to.deep.equal(expected);
      });
      describe('throws when data is invalid', () => {
        // arrange
        const testCases = [
          {
            expectedError: 'no collection provided',
            data: [],
          },
          {
            expectedError: 'undefined collection provided',
            data: [new CollectionDataStub(), undefined],
          },
        ];
        for (const testCase of testCases) {
          it(testCase.expectedError, () => {
            const parserMock = new CategoryCollectionParserSpy().mockParser();
            const env = getProcessEnvironmentStub();
            // act
            const act = () => parseApplication(parserMock, env, testCase.data);
            // assert
            expect(act).to.throw(testCase.expectedError);
          });
        }
      });
    });
  });
});

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
