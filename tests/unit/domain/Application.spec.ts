import 'mocha';
import { expect } from 'chai';
import { Application } from '@/domain/Application';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { CategoryCollectionStub } from '@tests/unit/stubs/CategoryCollectionStub';
import { ProjectInformationStub } from '@tests/unit/stubs/ProjectInformationStub';
import { AbsentObjectTestCases, getAbsentCollectionTestCases, itEachAbsentObjectValue } from '@tests/unit/shared/TestCases/AbsentTests';
import { ICategoryCollection } from '@/domain/ICategoryCollection';

describe('Application', () => {
  describe('getCollection', () => {
    it('returns undefined if not found', () => {
      // arrange
      const expected = undefined;
      const info = new ProjectInformationStub();
      const collections = [new CategoryCollectionStub().withOs(OperatingSystem.Windows)];
      // act
      const sut = new Application(info, collections);
      const actual = sut.getCollection(OperatingSystem.Android);
      // assert
      expect(actual).to.equals(expected);
    });
    it('returns expected when multiple collections exist', () => {
      // arrange
      const os = OperatingSystem.Windows;
      const expected = new CategoryCollectionStub().withOs(os);
      const info = new ProjectInformationStub();
      const collections = [expected, new CategoryCollectionStub().withOs(OperatingSystem.Android)];
      // act
      const sut = new Application(info, collections);
      const actual = sut.getCollection(os);
      // assert
      expect(actual).to.equals(expected);
    });
  });
  describe('ctor', () => {
    describe('info', () => {
      describe('throws if missing', () => {
        itEachAbsentObjectValue((absentValue) => {
          // arrange
          const expectedError = 'missing project information';
          const info = absentValue;
          const collections = [new CategoryCollectionStub()];
          // act
          const act = () => new Application(info, collections);
          // assert
          expect(act).to.throw(expectedError);
        });
      });
      it('sets as expected', () => {
        // arrange
        const expected = new ProjectInformationStub();
        const collections = [new CategoryCollectionStub()];
        // act
        const sut = new Application(expected, collections);
        // assert
        expect(sut.info).to.equal(expected);
      });
    });
    describe('collections', () => {
      describe('throws on invalid value', () => {
        // arrange
        const testCases: readonly {
          name: string,
          expectedError: string,
          value: readonly ICategoryCollection[],
        }[] = [
          ...getAbsentCollectionTestCases<ICategoryCollection>().map((testCase) => ({
            name: testCase.valueName,
            expectedError: 'missing collections',
            value: testCase.absentValue,
          })),
          ...AbsentObjectTestCases.map((testCase) => ({
            name: `${testCase.valueName} value in list`,
            expectedError: 'missing collection in the list',
            value: [new CategoryCollectionStub(), testCase.absentValue],
          })),
          {
            name: 'two collections with same OS',
            expectedError: 'multiple collections with same os: windows',
            value: [
              new CategoryCollectionStub().withOs(OperatingSystem.Windows),
              new CategoryCollectionStub().withOs(OperatingSystem.Windows),
              new CategoryCollectionStub().withOs(OperatingSystem.BlackBerry),
            ],
          },
        ];
        for (const testCase of testCases) {
          it(testCase.name, () => {
            const info = new ProjectInformationStub();
            const collections = testCase.value;
            // act
            const act = () => new Application(info, collections);
            // assert
            expect(act).to.throw(testCase.expectedError);
          });
        }
      });
      it('sets as expected', () => {
        // arrange
        const info = new ProjectInformationStub();
        const expected = [new CategoryCollectionStub()];
        // act
        const sut = new Application(info, expected);
        // assert
        expect(sut.collections).to.equal(expected);
      });
    });
  });
  describe('getSupportedOsList', () => {
    it('returns expected', () => {
      // arrange
      const expected = [OperatingSystem.Windows, OperatingSystem.macOS];
      const info = new ProjectInformationStub();
      const collections = expected.map((os) => new CategoryCollectionStub().withOs(os));
      // act
      const sut = new Application(info, collections);
      const actual = sut.getSupportedOsList();
      // assert
      expect(actual).to.deep.equal(expected);
    });
  });
});
