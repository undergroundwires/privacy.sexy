import 'mocha';
import { expect } from 'chai';
import { scrambledEqual } from '@/application/Common/Array';
import { sequenceEqual } from '@/application/Common/Array';
import { ComparerTestScenario } from './Array.ComparerTestScenario';

describe('Array', () => {
    describe('scrambledEqual', () => {
        describe('throws if arguments are undefined', () => {
            it('first argument is undefined', () => {
                const expectedError = 'undefined first array';
                const act = () => scrambledEqual(undefined, []);
                expect(act).to.throw(expectedError);
            });
            it('second arguments is undefined', () => {
                const expectedError = 'undefined second array';
                const act = () => scrambledEqual([], undefined);
                expect(act).to.throw(expectedError);
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
        describe('throws if arguments are undefined', () => {
            it('first argument is undefined', () => {
                const expectedError = 'undefined first array';
                const act = () => sequenceEqual(undefined, []);
                expect(act).to.throw(expectedError);
            });
            it('second arguments is undefined', () => {
                const expectedError = 'undefined second array';
                const act = () => sequenceEqual([], undefined);
                expect(act).to.throw(expectedError);
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
