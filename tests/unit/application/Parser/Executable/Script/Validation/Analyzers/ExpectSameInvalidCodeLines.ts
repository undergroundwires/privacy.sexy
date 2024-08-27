import { expect } from 'vitest';
import type { InvalidCodeLine } from '@/application/Parser/Executable/Script/Validation/Analyzers/CodeValidationAnalyzer';

export function expectSameInvalidCodeLines(
  expected: readonly InvalidCodeLine[],
  actual: readonly InvalidCodeLine[],
) {
  expect(sort(expected)).to.deep.equal(sort(actual));
}

function sort(lines: readonly InvalidCodeLine[]) { // To ignore order
  return Array.from(lines).sort((a, b) => a.lineNumber - b.lineNumber);
}
