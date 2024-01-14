/**
 * Asserts that the provided boolean value is true.
 *
 * Useful when TypeScript's control flow analysis does not recognize standard
 * assertions, ensuring `value` is treated as true in subsequent code. This helps
 * prevent type errors and improves code safety and clarity. An optional custom
 * error message can be provided for more detailed assertion failures.
 */
export function expectTrue(value: boolean, errorMessage?: string): asserts value is true {
  if (value !== true) {
    throw new Error([
      `Assertion failed: Expected true, received ${value.toString()}.`,
      'Assertion failed: expected value is not true.',
      ...(typeof value !== 'boolean' ? [`Received type: ${typeof value}`] : []),
      ...(errorMessage ? [errorMessage] : []),
    ].join('\n'));
  }
}
