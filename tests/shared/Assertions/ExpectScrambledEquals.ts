import { expect } from 'vitest';

/**
 * Asserts that two arrays contain the same elements regardless of order.
 */
export function expectScrambledEquals<T>(
  array1: readonly T[],
  array2: readonly T[],
): void {
  expect(array1).to.have.lengthOf(array2.length);
  expect(array1).to.have.members(array2);
}
