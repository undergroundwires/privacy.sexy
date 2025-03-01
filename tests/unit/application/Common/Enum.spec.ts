import { describe, it, expect } from 'vitest';
import {
  getEnumNames, getEnumValues, createEnumParser, assertInRange,
} from '@/application/Common/Enum';
import { getAbsentStringTestCases } from '@tests/unit/shared/TestCases/AbsentTests';
import { expectArrayEquals } from '@tests/shared/Assertions/ExpectArrayEquals';
import { EnumRangeTestRunner } from './EnumRangeTestRunner';

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
      const testScenarios: ReadonlyArray<{
        readonly name: string;
        readonly value: string;
        readonly expectedError: string;
      }> = [
        ...getAbsentStringTestCases({
          excludeNull: true,
          excludeUndefined: true,
        }).map((test) => ({
          name: test.valueName,
          value: test.absentValue,
          expectedError: `missing ${enumName}`,
        })),
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
          value: 55 as never,
          expectedError: `unexpected type of ${enumName}: "number"`,
        },
      ];
        // act
      for (const testCase of testScenarios) {
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
      const expected = ['TestValue1', 'testValue2', 'testvalue3', 'TESTVALUE4'];
      // act
      const actual = getEnumNames(TestEnum);
      // assert
      expectArrayEquals(expected, actual);
    });
  });
  describe('getEnumValues', () => {
    it('parses as expected', () => {
      // arrange
      enum TestEnum { Red, Green, Blue }
      const expected = [TestEnum.Red, TestEnum.Green, TestEnum.Blue];
      // act
      const actual = getEnumValues(TestEnum);
      // assert
      expectArrayEquals(expected, actual);
    });
  });
  describe('assertInRange', () => {
    // arrange
    enum TestEnum { Red, Green, Blue }
    const validValue = TestEnum.Red;
    // act
    const act = (value: TestEnum) => assertInRange(value, TestEnum);
    // assert
    new EnumRangeTestRunner(act)
      .testOutOfRangeThrows()
      .testValidValueDoesNotThrow(validValue);
  });
});
