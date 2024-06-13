import { describe, it, expect } from 'vitest';
import { createTypeValidator } from '@/application/Parser/Common/TypeValidator';
import { itEachAbsentObjectValue } from '@tests/unit/shared/TestCases/AbsentTests';

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
        const emptyArrayValue = [];
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
});

function createObjectWithProperties(properties: readonly string[]): object {
  const object = {};
  properties.forEach((propertyName) => {
    object[propertyName] = 'arbitrary value';
  });
  return object;
}
