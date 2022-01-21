import 'mocha';
import { expect } from 'chai';
import { scrambledEqual, sequenceEqual } from '@/application/Common/Array';
import { itEachAbsentObjectValue } from '@tests/unit/common/AbsentTests';
import { ComparerTestScenario } from './Array.ComparerTestScenario';

describe('Array', () => {
  describe('scrambledEqual', () => {
    describe('throws if arguments are absent', () => {
      describe('first argument is absent', () => {
        itEachAbsentObjectValue((absentValue) => {
          // arrange
          const expectedError = 'missing first array';
          const firstArray = absentValue;
          const secondArray = [];
          // act
          const act = () => scrambledEqual(firstArray, secondArray);
          // assert
          expect(act).to.throw(expectedError);
        });
      });
      describe('second argument is absent', () => {
        itEachAbsentObjectValue((absentValue) => {
          // arrange
          const expectedError = 'missing second array';
          const firstArray = [];
          const secondArray = absentValue;
          // act
          const act = () => scrambledEqual(firstArray, secondArray);
          // assert
          expect(act).to.throw(expectedError);
        });
      });
    });
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
    describe('throws if arguments are absent', () => {
      describe('first argument is absent', () => {
        itEachAbsentObjectValue((absentValue) => {
          // arrange
          const expectedError = 'missing first array';
          const firstArray = absentValue;
          const secondArray = [];
          // act
          const act = () => sequenceEqual(firstArray, secondArray);
          // assert
          expect(act).to.throw(expectedError);
        });
      });
      describe('second argument is absent', () => {
        itEachAbsentObjectValue((absentValue) => {
          // arrange
          const expectedError = 'missing second array';
          const firstArray = [];
          const secondArray = absentValue;
          // act
          const act = () => sequenceEqual(firstArray, secondArray);
          // assert
          expect(act).to.throw(expectedError);
        });
      });
    });
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
});
