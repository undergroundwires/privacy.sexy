import { it, expect } from 'vitest';
import type { ICodeValidationRule, IInvalidCodeLine } from '@/application/Parser/Script/Validation/ICodeValidationRule';
import type { ICodeLine } from '@/application/Parser/Script/Validation/ICodeLine';

interface ICodeValidationRuleTestCase {
  testName: string;
  codeLines: readonly string[];
  expected: readonly IInvalidCodeLine[];
  sut: ICodeValidationRule;
}

export function testCodeValidationRule(testCases: readonly ICodeValidationRuleTestCase[]) {
  for (const testCase of testCases) {
    it(testCase.testName, () => {
      // arrange
      const { sut } = testCase;
      const codeLines = createCodeLines(testCase.codeLines);
      // act
      const actual = sut.analyze(codeLines);
      // assert
      function sort(lines: readonly IInvalidCodeLine[]) { // To ignore order
        return Array.from(lines).sort((a, b) => a.index - b.index);
      }
      expect(sort(actual)).to.deep.equal(sort(testCase.expected));
    });
  }
}

function createCodeLines(lines: readonly string[]): ICodeLine[] {
  return lines.map((lineText, index): ICodeLine => (
    {
      index: index + 1,
      text: lineText,
    }
  ));
}
