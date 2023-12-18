import { it, describe, expect } from 'vitest';
import { provideWindowVariables } from '@/presentation/electron/preload/ContextBridging/RendererApiProvider';
import {
  isArray, isBoolean, isFunction, isNullOrUndefined, isNumber, isPlainObject, isString,
} from '@/TypeHelpers';

describe('RendererApiProvider', () => {
  describe('provideWindowVariables', () => {
    describe('conforms to Electron\'s context bridging requirements', () => {
      // https://www.electronjs.org/docs/latest/api/context-bridge
      const variables = provideWindowVariables();
      Object.entries(variables).forEach(([key, value]) => {
        it(`\`${key}\` conforms to allowed types for context bridging`, () => {
          // act
          const act = () => checkAllowedType(value);
          // assert
          expect(act).to.not.throw();
        });
      });
    });
  });
});

function checkAllowedType(value: unknown): void {
  if (isBasicType(value)) {
    return;
  }
  if (isArray(value)) {
    checkArrayElements(value);
    return;
  }
  if (!isPlainObject(value)) {
    throw new Error(`Type error: Expected a valid object, array, or primitive type, but received type '${typeof value}'.`);
  }
  if (isNullOrUndefined(value)) {
    throw new Error('Type error: Value is null or undefined, which is not allowed.');
  }
  checkObjectProperties(value);
}

function isBasicType(value: unknown): boolean {
  return isString(value) || isNumber(value) || isBoolean(value) || isFunction(value);
}

function checkArrayElements(array: unknown[]): void {
  array.forEach((item, index) => {
    try {
      checkAllowedType(item);
    } catch (error) {
      throw new Error(`Invalid array element at index ${index}: ${error.message}`);
    }
  });
}

function checkObjectProperties(obj: NonNullable<object>): void {
  if (Object.keys(obj).some((key) => !isString(key))) {
    throw new Error('Type error: At least one object key is not a string, which violates the allowed types.');
  }
  Object.entries(obj).forEach(([key, memberValue]) => {
    try {
      checkAllowedType(memberValue);
    } catch (error) {
      throw new Error(`Invalid object property '${key}': ${error.message}`);
    }
  });
}
