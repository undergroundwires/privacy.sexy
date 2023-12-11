import { describe, it, expect } from 'vitest';
import { Application } from '@/domain/Application';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { CategoryCollectionStub } from '@tests/unit/shared/Stubs/CategoryCollectionStub';
import { ProjectInformationStub } from '@tests/unit/shared/Stubs/ProjectInformationStub';
import { ICategoryCollection } from '@/domain/ICategoryCollection';
import { getAbsentCollectionTestCases } from '@tests/unit/shared/TestCases/AbsentTests';

describe('Application', () => {
  describe('getCollection', () => {
    it('throws if not found', () => {
      // arrange
      const missingOs = OperatingSystem.Android;
      const expectedError = `Operating system "${OperatingSystem[missingOs]}" is not defined in application`;
      const info = new ProjectInformationStub();
      const collections = [new CategoryCollectionStub().withOs(OperatingSystem.Windows)];
      // act
      const sut = new Application(info, collections);
      const act = () => sut.getCollection(missingOs);
      // assert
      expect(act).to.throw(expectedError);
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
          readonly name: string,
          readonly expectedError: string,
          readonly value: readonly ICategoryCollection[],
        }[] = [
          ...getAbsentCollectionTestCases<ICategoryCollection>(
            {
              excludeUndefined: true,
              excludeNull: true,
            },
          ).map((testCase) => ({
            name: `empty collection: ${testCase.valueName}`,
            expectedError: 'missing collections',
            value: testCase.absentValue,
          })),
          {
            name: 'two collections with same OS',
            expectedError: 'multiple collections with same os: windows',
            value: [
              new CategoryCollectionStub().withOs(OperatingSystem.Windows),
              new CategoryCollectionStub().withOs(OperatingSystem.Windows),
              new CategoryCollectionStub().withOs(OperatingSystem.BlackBerry10),
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
