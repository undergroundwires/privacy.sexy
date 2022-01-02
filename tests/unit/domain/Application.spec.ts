import 'mocha';
import { expect } from 'chai';
import { Application } from '@/domain/Application';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { CategoryCollectionStub } from '@tests/unit/stubs/CategoryCollectionStub';
import { ProjectInformationStub } from '@tests/unit/stubs/ProjectInformationStub';

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
      it('throws if undefined', () => {
        // arrange
        const expectedError = 'undefined project information';
        const info = undefined;
        const collections = [new CategoryCollectionStub()];
        // act
        const act = () => new Application(info, collections);
        // assert
        expect(act).to.throw(expectedError);
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
        const testCases = [
          {
            name: 'undefined',
            expectedError: 'undefined collections',
            value: undefined,
          },
          {
            name: 'empty',
            expectedError: 'no collection in the list',
            value: [],
          },
          {
            name: 'undefined value in list',
            expectedError: 'undefined collection in the list',
            value: [new CategoryCollectionStub(), undefined],
          },
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
          const info = new ProjectInformationStub();
          const collections = testCase.value;
          // act
          const act = () => new Application(info, collections);
          // assert
          expect(act).to.throw(testCase.expectedError);
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
