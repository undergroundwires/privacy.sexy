import { expect } from 'vitest';

interface ArrayEqualityCheckOptions {
  readonly deep: boolean;
  readonly ignoreOrder: boolean;
}

/**
 * Asserts that two arrays contain the same elements.
 */
export function expectArrayEquals<T>(
  actual: readonly T[],
  expected: readonly T[],
  { deep = false, ignoreOrder = false }: Partial<ArrayEqualityCheckOptions> = {},
): void {
  if (deep && ignoreOrder) {
    expectArrayScrambledDeepEquals(actual, expected);
  } else if (deep && !ignoreOrder) {
    expectArraySequentialDeepEquals(actual, expected);
  } else if (!deep && ignoreOrder) {
    expectArrayScrambledEquals(actual, expected);
  } else {
    expectArraySequentialEquals(actual, expected);
  }
}

function expectArraySequentialEquals<T>(
  actual: readonly T[],
  expected: readonly T[],
) {
  expect(actual).to.include.ordered.members(expected);
}

function expectArraySequentialDeepEquals<T>(
  actual: readonly T[],
  expected: readonly T[],
) {
  expect(actual).to.include.deep.ordered.members(expected);
}

function expectArrayScrambledEquals<T>(
  actual: readonly T[],
  expected: readonly T[],
) {
  expect(actual).to.have.lengthOf(expected.length);
  expect(actual).have.members(expected); // https://github.com/chaijs/chai/pull/153
}

function expectArrayScrambledDeepEquals<T>(
  actual: readonly T[],
  expected: readonly T[],
) {
  expect(actual).to.have.lengthOf(expected.length);
  expect(actual).have.deep.members(expected);
}
