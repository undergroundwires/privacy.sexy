// import * as assert from 'assert';
import { expect } from 'chai';

// Using manual checks because expect(act).to.throw(obj) does not work
// chaijs/chai#1065, chaijs/chai#1405
export function expectThrowsError<T extends Error>(delegate: () => void, expected: T) {
  // arrange
  if (!expected) {
    throw new Error('missing expected');
  }
  let actual: T | undefined;
  // act
  try {
    delegate();
  } catch (error) {
    actual = error;
  }
  // assert
  expect(Boolean(actual)).to.equal(true, `Expected to throw "${expected.name}" but delegate did not throw at all.`);
  expect(Boolean(actual?.stack)).to.equal(true, 'Empty stack trace.');
  expect(expected.message).to.equal(actual.message);
  expect(expected.name).to.equal(actual.name);
  expectDeepEqualsIgnoringUndefined(expected, actual);
}

function expectDeepEqualsIgnoringUndefined(expected: unknown, actual: unknown) {
  const actualClean = removeUndefinedProperties(actual);
  const expectedClean = removeUndefinedProperties(expected);
  expect(expectedClean).to.deep.equal(actualClean);
}

function removeUndefinedProperties(obj: unknown): unknown {
  return Object.keys(obj ?? {})
    .reduce((acc, key) => {
      const value = obj[key];
      switch (typeof value) {
        case 'object': {
          const cleanValue = removeUndefinedProperties(value); // recurse
          if (!Object.keys(cleanValue).length) {
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
