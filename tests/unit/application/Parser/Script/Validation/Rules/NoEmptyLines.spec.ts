import { describe } from 'vitest';
import { NoEmptyLines } from '@/application/Parser/Script/Validation/Rules/NoEmptyLines';
import { testCodeValidationRule } from './CodeValidationRuleTestRunner';

describe('NoEmptyLines', () => {
  describe('analyze', () => {
    testCodeValidationRule([
      {
        testName: 'no results when code is valid',
        codeLines: ['non-empty-line1', 'none-empty-line2'],
        expected: [],
        sut: new NoEmptyLines(),
      },
      {
        testName: 'shows error for empty line',
        codeLines: ['first line', '', 'third line'],
        expected: [{ index: 2, error: 'Empty line' }],
        sut: new NoEmptyLines(),
      },
      {
        testName: 'shows error for multiple empty lines',
        codeLines: ['first line', '', 'third line', ''],
        expected: [2, 4].map((index) => ({ index, error: 'Empty line' })),
        sut: new NoEmptyLines(),
      },
      {
        testName: 'shows error for undefined and null lines',
        codeLines: ['first line', undefined, 'third line', null],
        expected: [2, 4].map((index) => ({ index, error: 'Empty line' })),
        sut: new NoEmptyLines(),
      },
      {
        testName: 'shows error for whitespace-only lines',
        codeLines: ['first line', '  ', 'third line'],
        expected: [{ index: 2, error: 'Empty line: "{whitespace}{whitespace}"' }],
        sut: new NoEmptyLines(),
      },
      {
        testName: 'shows error for tab-only lines',
        codeLines: ['first line', '\t\t', 'third line'],
        expected: [{ index: 2, error: 'Empty line: "{tab}{tab}"' }],
        sut: new NoEmptyLines(),
      },
      {
        testName: 'shows error for lines that consists of whitespace and tabs',
        codeLines: ['first line', '\t \t', 'third line', ' \t '],
        expected: [{ index: 2, error: 'Empty line: "{tab}{whitespace}{tab}"' }, { index: 4, error: 'Empty line: "{whitespace}{tab}{whitespace}"' }],
        sut: new NoEmptyLines(),
      },
    ]);
  });
});
