import { expect } from 'vitest';
import { expectExists } from './ExpectExists';

// `toThrowError` does not assert the error type (https://github.com/vitest-dev/vitest/blob/v0.34.2/docs/api/expect.md#tothrowerror)
export function expectDeepThrowsError<T extends Error>(delegate: () => void, expected: T) {
  // arrange
  let actual: T | undefined;
  // act
  try {
    delegate();
  } catch (error) {
    actual = error;
  }
  // assert
  expectExists(actual);
  expect(Boolean(actual.stack)).to.equal(true, 'Empty stack trace.');
  expect(expected.message).to.equal(actual.message);
  expect(expected.name).to.equal(actual.name);
  expectDeepEqualsIgnoringUndefined(expected, actual);
}

function expectDeepEqualsIgnoringUndefined(
  expected: object | undefined,
  actual: object | undefined,
) {
  const actualClean = removeUndefinedProperties(actual);
  const expectedClean = removeUndefinedProperties(expected);
  expect(expectedClean).to.deep.equal(actualClean);
}

function removeUndefinedProperties(obj: object | undefined): object | undefined {
  if (!obj) {
    return obj;
  }
  return Object.entries(obj).reduce((acc, [key, value]) => {
    switch (typeof value) {
      case 'object': {
        const cleanValue = removeUndefinedProperties(value); // recurse
        if (!cleanValue || !Object.keys(cleanValue).length) {
          return { ...acc };
        }
        return { ...acc, [key]: cleanValue };
      }
      case 'undefined':
        return { ...acc };
      default:
        return { ...acc, [key]: value };
    }
  }, {});
}
