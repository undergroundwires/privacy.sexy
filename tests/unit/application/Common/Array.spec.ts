import { describe, it, expect } from 'vitest';
import { scrambledEqual, sequenceEqual } from '@/application/Common/Array';
import { ComparerTestScenario } from './Array.ComparerTestScenario';

describe('Array', () => {
  describe('scrambledEqual', () => {
    describe('returns as expected', () => {
      // arrange
      const scenario = new ComparerTestScenario()
        .addSameItemsWithSameOrder(true)
        .addSameItemsWithDifferentOrder(true)
        .addDifferentItemsWithSameLength(false)
        .addDifferentItemsWithDifferentLength(false);
      // act
      scenario.forEachCase((testCase) => {
        it(testCase.name, () => {
          const actual = scrambledEqual(testCase.first, testCase.second);
          // assert
          expect(actual).to.equal(testCase.expected);
        });
      });
    });
  });
  describe('sequenceEqual', () => {
    describe('returns as expected', () => {
      // arrange
      const scenario = new ComparerTestScenario()
        .addSameItemsWithSameOrder(true)
        .addSameItemsWithDifferentOrder(false)
        .addDifferentItemsWithSameLength(false)
        .addDifferentItemsWithDifferentLength(false);
      // act
      scenario.forEachCase((testCase) => {
        it(testCase.name, () => {
          const actual = sequenceEqual(testCase.first, testCase.second);
          // assert
          expect(actual).to.equal(testCase.expected);
        });
      });
    });
  });
});
