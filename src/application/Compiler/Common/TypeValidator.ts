import type { PropertyKeys } from '@/TypeHelpers';
import {
  isNullOrUndefined, isArray, isPlainObject, isString,
} from '@/TypeHelpers';

export interface TypeValidator {
  assertObject<T>(assertion: ObjectAssertion<T>): void;
  assertNonEmptyCollection(assertion: NonEmptyCollectionAssertion): void;
  assertNonEmptyString(assertion: NonEmptyStringAssertion): void;
}

export interface NonEmptyCollectionAssertion {
  readonly value: unknown;
  readonly valueName: string;
}

export interface RegexValidationRule {
  readonly expectedMatch: RegExp;
  readonly errorMessage: string;
}

export interface NonEmptyStringAssertion {
  readonly value: unknown;
  readonly valueName: string;
  readonly rule?: RegexValidationRule;
}

export interface ObjectAssertion<T> {
  readonly value: T | unknown;
  readonly valueName: string;
  readonly allowedProperties?: readonly PropertyKeys<T>[];
}

export function createTypeValidator(): TypeValidator {
  return {
    assertObject: (assertion) => {
      assertDefined(assertion.value, assertion.valueName);
      assertPlainObject(assertion.value, assertion.valueName);
      assertNoEmptyProperties(assertion.value, assertion.valueName);
      if (assertion.allowedProperties !== undefined) {
        const allowedProperties = assertion.allowedProperties.map((p) => p as string);
        assertAllowedProperties(assertion.value, assertion.valueName, allowedProperties);
      }
    },
    assertNonEmptyCollection: (assertion) => {
      assertDefined(assertion.value, assertion.valueName);
      assertArray(assertion.value, assertion.valueName);
      assertNonEmpty(assertion.value, assertion.valueName);
    },
    assertNonEmptyString: (assertion) => {
      assertDefined(assertion.value, assertion.valueName);
      assertString(assertion.value, assertion.valueName);
      if (assertion.value.length === 0) {
        throw new Error(`'${assertion.valueName}' is missing.`);
      }
      if (assertion.rule) {
        if (!assertion.value.match(assertion.rule.expectedMatch)) {
          throw new Error(assertion.rule.errorMessage);
        }
      }
    },
  };
}

function assertDefined<T>(
  value: T,
  valueName: string,
): asserts value is NonNullable<T> {
  if (isNullOrUndefined(value)) {
    throw new Error(`'${valueName}' is missing.`);
  }
}

function assertPlainObject(
  value: unknown,
  valueName: string,
): asserts value is object {
  if (!isPlainObject(value)) {
    throw new Error(`'${valueName}' is not an object.`);
  }
}

function assertNoEmptyProperties(
  value: object,
  valueName: string,
): void {
  if (Object.keys(value).length === 0) {
    throw new Error(`'${valueName}' is an empty object without properties.`);
  }
}

function assertAllowedProperties(
  value: object,
  valueName: string,
  allowedProperties: readonly string[],
): void {
  const properties = Object.keys(value).map((p) => p as string);
  const disallowedProperties = properties.filter(
    (prop) => !allowedProperties.map((p) => p as string).includes(prop),
  );
  if (disallowedProperties.length > 0) {
    throw new Error(`'${valueName}' has disallowed properties: ${disallowedProperties.join(', ')}.`);
  }
}

function assertArray(
  value: unknown,
  valueName: string,
): asserts value is Array<unknown> {
  if (!isArray(value)) {
    throw new Error(`${valueName} should be of type 'array', but is of type '${typeof value}'.`);
  }
}

function assertString(
  value: unknown,
  valueName: string,
): asserts value is string {
  if (!isString(value)) {
    throw new Error(`${valueName} should be of type 'string', but is of type '${typeof value}'.`);
  }
}

function assertNonEmpty(
  value: Array<unknown>,
  valueName: string,
): void {
  if (value.length === 0) {
    throw new Error(`'${valueName}' cannot be an empty array.`);
  }
}
