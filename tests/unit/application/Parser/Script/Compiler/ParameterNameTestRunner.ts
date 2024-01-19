import { describe, it, expect } from 'vitest';

export function testParameterName(action: (parameterName: string) => string) {
  describe('name', () => {
    describe('sets as expected', () => {
      // arrange
      const expectedValues: readonly string[] = [
        'lowercase',
        'onlyLetters',
        'l3tt3rsW1thNumb3rs',
      ];
      for (const expected of expectedValues) {
        it(expected, () => {
          // act
          const value = action(expected);
          // assert
          expect(value).to.equal(expected);
        });
      }
    });
    describe('throws if invalid', () => {
      // arrange
      const testScenarios: readonly {
        readonly description: string;
        readonly value: string;
        readonly expectedError: string;
      }[] = [
        {
          description: 'empty Name',
          value: '',
          expectedError: 'missing parameter name',
        },
        {
          description: 'has @',
          value: 'b@d',
          expectedError: 'parameter name must be alphanumeric but it was "b@d"',
        },
        {
          description: 'has {',
          value: 'b{a}d',
          expectedError: 'parameter name must be alphanumeric but it was "b{a}d"',
        },
      ];
      for (const { description, value, expectedError } of testScenarios) {
        it(description, () => {
          // act
          const act = () => action(value);
          // assert
          expect(act).to.throw(expectedError);
        });
      }
    });
  });
}
