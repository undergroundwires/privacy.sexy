import 'mocha';
import { expect } from 'chai';
import { getEnumNames, getEnumValues, createEnumParser } from '@/application/Common/Enum';

describe('Enum', () => {
    describe('createEnumParser', () => {
        enum ParsableEnum { Value1, value2 }
        describe('parses as expected', () => {
            // arrange
            const testCases = [
                {
                    name: 'case insensitive',
                    value: 'vALuE1',
                    expected: ParsableEnum.Value1,
                },
                {
                    name: 'exact match',
                    value: 'value2',
                    expected: ParsableEnum.value2,
                },
            ];
            // act
            for (const testCase of testCases) {
                it(testCase.name, () => {
                    const parser = createEnumParser(ParsableEnum);
                    const actual = parser.parseEnum(testCase.value, 'non-important');
                    // assert
                    expect(actual).to.equal(testCase.expected);
                });
            }
        });
        describe('throws as expected', () => {
            // arrange
            const enumName = 'ParsableEnum';
            const testCases = [
                {
                    name: 'undefined',
                    value: undefined,
                    expectedError: `undefined ${enumName}`,
                },
                {
                    name: 'empty',
                    value: '',
                    expectedError: `undefined ${enumName}`,
                },
                {
                    name: 'out of range',
                    value: 'value3',
                    expectedError: `unknown ${enumName}: "value3"`,
                },
                {
                    name: 'out of range',
                    value: 'value3',
                    expectedError: `unknown ${enumName}: "value3"`,
                },
                {
                    name: 'unexpected type',
                    value: 55 as any,
                    expectedError: `unexpected type of ${enumName}: "number"`,
                },
            ];
            // act
            for (const testCase of testCases) {
                it(testCase.name, () => {
                    const parser = createEnumParser(ParsableEnum);
                    const act = () => parser.parseEnum(testCase.value, enumName);
                    // assert
                    expect(act).to.throw(testCase.expectedError);
                });
            }
        });
    });
    describe('getEnumNames', () => {
        it('parses as expected', () => {
            // arrange
            enum TestEnum { TestValue1, testValue2, testvalue3, TESTVALUE4 }
            const expected = [ 'TestValue1', 'testValue2', 'testvalue3', 'TESTVALUE4' ];
            // act
            const actual = getEnumNames(TestEnum);
            // assert
            expect(expected.sort()).to.deep.equal(actual.sort());
        });
    });
    describe('getEnumValues', () => {
        it('parses as expected', () => {
            // arrange
            enum TestEnum { Red, Green, Blue }
            const expected = [ TestEnum.Red, TestEnum.Green, TestEnum.Blue ];
            // act
            const actual = getEnumValues(TestEnum);
            // assert
            expect(expected.sort()).to.deep.equal(actual.sort());
        });
    });
});
