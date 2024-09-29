import { describe, it, expect } from 'vitest';
import { createTypeValidator, type NonEmptyStringAssertion, type RegexValidationRule } from '@/application/Parser/Common/TypeValidator';
import { itEachAbsentObjectValue, itEachAbsentStringValue } from '@tests/unit/shared/TestCases/AbsentTests';

describe('createTypeValidator', () => {
  describe('assertObject', () => {
    describe('with valid object', () => {
      it('accepts object with allowed properties', () => {
        // arrange
        const expectedProperties = ['expected1', 'expected2'];
        const validValue = createObjectWithProperties(expectedProperties);
        const { assertObject } = createTypeValidator();
        // act
        const act = () => assertObject({
          value: validValue,
          valueName: 'unimportant name',
          allowedProperties: expectedProperties,
        });
        // assert
        expect(act).to.not.throw();
      });
      it('accepts object with extra unspecified properties', () => {
        // arrange
        const validValue = createObjectWithProperties(['unevaluated property']);
        const { assertObject } = createTypeValidator();
        // act
        const act = () => assertObject({
          value: validValue,
          valueName: 'unimportant name',
        });
        // assert
        expect(act).to.not.throw();
      });
    });
    describe('with invalid object', () => {
      describe('throws error for missing object', () => {
        itEachAbsentObjectValue((absentValue) => {
          // arrange
          const valueName = 'absent object value';
          const expectedMessage = `'${valueName}' is missing.`;
          const { assertObject } = createTypeValidator();
          // act
          const act = () => assertObject({ value: absentValue, valueName });
          // assert
          expect(act).to.throw(expectedMessage);
        });
      });
      it('throws error for object without properties', () => {
        // arrange
        const emptyObjectValue: object = {};
        const valueName = 'empty object without properties.';
        const expectedMessage = `'${valueName}' is an empty object without properties.`;
        const { assertObject } = createTypeValidator();
        // act
        const act = () => assertObject({ value: emptyObjectValue, valueName });
        // assert
        expect(act).to.throw(expectedMessage);
      });
      describe('incorrect data type', () => {
        // arrange
        const testScenarios: readonly {
          readonly value: unknown;
          readonly valueName: string;
        }[] = [
          {
            value: ['1', '2'],
            valueName: 'array of strings',
          },
          {
            value: true,
            valueName: 'true boolean',
          },
          {
            value: 35,
            valueName: 'number',
          },
        ];
        testScenarios.forEach(({ value, valueName }) => {
          it(`throws error for ${valueName} passed as object`, () => {
            // arrange
            const expectedMessage = `'${valueName}' is not an object.`;
            const { assertObject } = createTypeValidator();
            // act
            const act = () => assertObject({ value, valueName });
            // assert
            expect(act).to.throw(expectedMessage);
          });
        });
      });
      it('throws error for object with disallowed properties', () => {
        // arrange
        const valueName = 'value with unexpected properties';
        const unexpectedProperties = ['unexpected-property-1', 'unexpected-property-2'];
        const expectedError = `'${valueName}' has disallowed properties: ${unexpectedProperties.join(', ')}.`;
        const expectedProperties = ['expected1', 'expected2'];
        const value = createObjectWithProperties(
          [...expectedProperties, ...unexpectedProperties],
        );
        const { assertObject } = createTypeValidator();
        // act
        const act = () => assertObject({
          value,
          valueName,
          allowedProperties: expectedProperties,
        });
        // assert
        expect(act).to.throw(expectedError);
      });
    });
  });
  describe('assertNonEmptyCollection', () => {
    describe('with valid collection', () => {
      it('accepts non-empty collection', () => {
        // arrange
        const validValue = ['array', 'of', 'strings'];
        const { assertNonEmptyCollection } = createTypeValidator();
        // act
        const act = () => assertNonEmptyCollection({ value: validValue, valueName: 'unimportant name' });
        // assert
        expect(act).to.not.throw();
      });
    });
    describe('with invalid collection', () => {
      describe('throws error for missing collection', () => {
        itEachAbsentObjectValue((absentValue) => {
          // arrange
          const valueName = 'absent collection value';
          const expectedMessage = `'${valueName}' is missing.`;
          const { assertNonEmptyCollection } = createTypeValidator();
          // act
          const act = () => assertNonEmptyCollection({ value: absentValue, valueName });
          // assert
          expect(act).to.throw(expectedMessage);
        });
      });
      it('throws error for empty collection', () => {
        // arrange
        const emptyArrayValue: unknown[] = [];
        const valueName = 'empty collection value';
        const expectedMessage = `'${valueName}' cannot be an empty array.`;
        const { assertNonEmptyCollection } = createTypeValidator();
        // act
        const act = () => assertNonEmptyCollection({ value: emptyArrayValue, valueName });
        // assert
        expect(act).to.throw(expectedMessage);
      });
    });
  });
  describe('assertNonEmptyString', () => {
    describe('with valid string', () => {
      it('accepts non-empty string without regex rule', () => {
        // arrange
        const nonEmptyString = 'hello';
        const { assertNonEmptyString } = createTypeValidator();
        // act
        const act = () => assertNonEmptyString({ value: nonEmptyString, valueName: 'unimportant name' });
        // assert
        expect(act).to.not.throw();
      });
      it('accepts if the string matches the regex', () => {
        // arrange
        const regex: RegExp = /goodbye/;
        const stringMatchingRegex = 'Valid string containing "goodbye"';
        const rule: RegexValidationRule = {
          expectedMatch: regex,
          errorMessage: 'String contain "goodbye"',
        };
        const { assertNonEmptyString } = createTypeValidator();
        // act
        const act = () => assertNonEmptyString({
          value: stringMatchingRegex,
          valueName: 'unimportant name',
          rule,
        });
        // assert
        expect(act).to.not.throw();
      });
    });
    describe('with invalid string', () => {
      describe('throws error for missing string', () => {
        itEachAbsentStringValue((absentValue) => {
          // arrange
          const valueName = 'absent string value';
          const expectedMessage = `'${valueName}' is missing.`;
          const { assertNonEmptyString } = createTypeValidator();
          // act
          const act = () => assertNonEmptyString({ value: absentValue, valueName });
          // assert
          expect(act).to.throw(expectedMessage);
        });
      });
      describe('throws error for non string values', () => {
        // arrange
        const testScenarios: readonly {
          readonly description: string;
          readonly invalidValue: unknown;
        }[] = [
          {
            description: 'number',
            invalidValue: 42,
          },
          {
            description: 'boolean',
            invalidValue: true,
          },
          {
            description: 'object',
            invalidValue: { property: 'value' },
          },
          {
            description: 'array',
            invalidValue: ['a', 'r', 'r', 'a', 'y'],
          },
        ];
        testScenarios.forEach(({
          description, invalidValue,
        }) => {
          it(description, () => {
            const valueName = 'invalidValue';
            const expectedMessage = `${valueName} should be of type 'string', but is of type '${typeof invalidValue}'.`;
            const { assertNonEmptyString } = createTypeValidator();
            // act
            const act = () => assertNonEmptyString({ value: invalidValue, valueName });
            // assert
            expect(act).to.throw(expectedMessage);
          });
        });
      });
      it('throws an error if the string does not match the regex', () => {
        // arrange
        const regex: RegExp = /goodbye/;
        const stringNotMatchingRegex = 'Hello';
        const expectedMessage = 'String should contain "goodbye"';
        const rule: RegexValidationRule = {
          expectedMatch: regex,
          errorMessage: expectedMessage,
        };
        const assertion: NonEmptyStringAssertion = {
          value: stringNotMatchingRegex,
          valueName: 'non-important-value-name',
          rule,
        };
        const { assertNonEmptyString } = createTypeValidator();
        // act
        const act = () => assertNonEmptyString(assertion);
        // assert
        expect(act).to.throw(expectedMessage);
      });
    });
  });
});

function createObjectWithProperties(properties: readonly string[]): object {
  const object: Record<string, unknown> = {};
  properties.forEach((propertyName) => {
    object[propertyName] = 'arbitrary value';
  });
  return object;
}
