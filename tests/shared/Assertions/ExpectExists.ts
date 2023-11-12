/**
 * Asserts that the provided value is neither null nor undefined.
 *
 * This function is a more explicit alternative to `expect(value).to.exist` in test cases.
 * It is particularly useful in situations where TypeScript's control flow analysis
 * does not recognize standard assertions, ensuring that `value` is treated as
 * non-nullable in the subsequent code. This can prevent potential type errors
 * and enhance code safety and clarity.
 */
export function expectExists<T>(value: T): asserts value is NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error('Expected value to exist');
  }
}
