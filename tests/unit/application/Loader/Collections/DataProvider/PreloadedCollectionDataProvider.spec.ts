import { describe, it, expect } from 'vitest';
import { loadPreloadedCollection } from '@/application/Loader/Collections/DataProvider/PreloadedCollectionDataProvider';
import { AllSupportedOperatingSystems } from '@tests/shared/TestCases/SupportedOperatingSystems';
import { OperatingSystem } from '@/domain/OperatingSystem';

describe('PreloadedCollectionDataProvider', () => {
  describe('loadPreloadedCollection', () => {
    describe('can load supported operating systems', () => {
      AllSupportedOperatingSystems.forEach((operatingSystem) => {
        it(`loads "${OperatingSystem[operatingSystem]}"`, () => {
          // arrange
          const expectedOperatingSystem = OperatingSystem[operatingSystem].toLowerCase();
          const filename = OperatingSystem[operatingSystem].toLowerCase();
          // act
          const data = loadPreloadedCollection(filename);
          // assert
          expect(data.os).to.equal(expectedOperatingSystem);
        });
      });
    });
    it('throws an error for unknown collection name', () => {
      // arrange
      const collectionName = 'unknown';
      const expectedErrorMessage = `Unknown collection file name "${collectionName}"`;
      // act
      const act = () => loadPreloadedCollection(collectionName);
      // assert
      expect(act).to.throw(expectedErrorMessage);
    });
  });
});
