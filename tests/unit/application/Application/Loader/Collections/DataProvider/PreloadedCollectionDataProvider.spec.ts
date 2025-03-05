import { describe, it, expect } from 'vitest';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import type { SupportedOperatingSystem } from '@tests/shared/TestCases/SupportedOperatingSystems';
import { loadPreloadedCollection } from '@/application/Application/Loader/Collections/DataProvider/PreloadedCollectionDataProvider';

describe('PreloadedCollectionDataProvider', () => {
  describe('load collections correctly', () => {
    // arrange
    const testScenarios: Record<SupportedOperatingSystem, {
      readonly validCollectionName: string;
    }> = {
      [OperatingSystem.macOS]: {
        validCollectionName: 'macos',
      },
      [OperatingSystem.Windows]: {
        validCollectionName: 'windows',
      },
      [OperatingSystem.Linux]: {
        validCollectionName: 'linux',
      },
    };
    Object.values(testScenarios)
      .forEach((scenario) => {
        it(scenario.validCollectionName, () => {
          // act
          const collection = loadPreloadedCollection(scenario.validCollectionName);
          // assert
          expectExists(collection);
        });
      });
  });
  it('throws for invalid collection name', () => {
    // arrange
    const invalidCollectionName = 'non existing collection name';
    const expectedError = `Unknown collection name "${invalidCollectionName}"`;
    // act
    const act = () => loadPreloadedCollection(invalidCollectionName);
    // assert
    expect(act).to.throw(expectedError);
  });
});
