import { expect } from 'vitest';
import type { InvalidCodeLine } from '@/application/Parser/Executable/Script/Validation/Analyzers/CodeValidationAnalyzer';
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';

export function expectSameInvalidCodeLines(
  expected: readonly InvalidCodeLine[],
  actual: readonly InvalidCodeLine[],
) {
  const sortedExpected = sort(expected);
  const sortedActual = sort(actual);

  expect(sortedActual).to.deep.equal(sortedExpected, formatAssertionMessage([
    'Invalid code lines do not match',
    `Expected: ${JSON.stringify(sortedExpected, null, 2)}`,
    `Actual: ${JSON.stringify(sortedActual, null, 2)}`,
  ]));
}

export function expectInvalidCodeLines(
  actual: readonly InvalidCodeLine[],
  expectedInvalidLineNumbers: readonly number[],
) {
  const sortedActualLineNumbers = actual.map((a) => a.lineNumber).sort();
  const sortedExpectedLineNumbers = [...expectedInvalidLineNumbers].sort();
  expect(sortedActualLineNumbers).to.deep.equal(sortedExpectedLineNumbers, formatAssertionMessage([
    'Invalid line numbers do not match.',
    `Expected (${sortedExpectedLineNumbers.length}): ${sortedExpectedLineNumbers.join(', ')}`,
    `Actual (${sortedActualLineNumbers.length}): ${sortedActualLineNumbers.join(', ')}`,
  ]));
}

function sort(lines: readonly InvalidCodeLine[]) { // To ignore order
  return Array.from(lines).sort((a, b) => a.lineNumber - b.lineNumber);
}
