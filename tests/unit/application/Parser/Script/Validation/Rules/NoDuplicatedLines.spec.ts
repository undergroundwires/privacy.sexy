import { describe } from 'vitest';
import { NoDuplicatedLines } from '@/application/Parser/Script/Validation/Rules/NoDuplicatedLines';
import { LanguageSyntaxStub } from '@tests/unit/shared/Stubs/LanguageSyntaxStub';
import { IInvalidCodeLine } from '@/application/Parser/Script/Validation/ICodeValidationRule';
import { testCodeValidationRule } from './CodeValidationRuleTestRunner';

describe('NoDuplicatedLines', () => {
  describe('analyze', () => {
    testCodeValidationRule([
      {
        testName: 'no results when code is valid',
        codeLines: ['unique1', 'unique2', 'unique3', 'unique4'],
        expected: [],
        sut: new NoDuplicatedLines(new LanguageSyntaxStub()),
      },
      {
        testName: 'detects single duplicated line as expected',
        codeLines: ['duplicate', 'duplicate', 'unique', 'duplicate'],
        expected: expectInvalidCodeLines([1, 2, 4]),
        sut: new NoDuplicatedLines(new LanguageSyntaxStub()),
      },
      {
        testName: 'detects multiple duplicated lines as expected',
        codeLines: ['duplicate1', 'duplicate2', 'unique', 'duplicate1', 'unique2', 'duplicate2'],
        expected: expectInvalidCodeLines([1, 4], [2, 6]),
        sut: new NoDuplicatedLines(new LanguageSyntaxStub()),
      },
      {
        testName: 'common code parts: does not detect multiple common code part usages as duplicates',
        codeLines: ['good', 'good', 'bad', 'bad', 'good', 'also-good', 'also-good', 'unique'],
        expected: expectInvalidCodeLines([3, 4]),
        sut: new NoDuplicatedLines(new LanguageSyntaxStub()
          .withCommonCodeParts('good', 'also-good')),
      },
      {
        testName: 'common code parts: does not detect multiple common code part used in same code line as duplicates',
        codeLines: ['bad', 'bad', 'good1 good2', 'good1 good2', 'good2 good1', 'good2 good1'],
        expected: expectInvalidCodeLines([1, 2]),
        sut: new NoDuplicatedLines(new LanguageSyntaxStub()
          .withCommonCodeParts('good2', 'good1')),
      },
      {
        testName: 'common code parts: detects when common code parts used in conjunction with unique words',
        codeLines: [
          'common-part1', 'common-part1', 'common-part1 common-part2', 'common-part1 unique', 'common-part1 unique',
          'common-part2', 'common-part2 common-part1', 'unique common-part2', 'unique common-part2',
        ],
        expected: expectInvalidCodeLines([4, 5], [8, 9]),
        sut: new NoDuplicatedLines(new LanguageSyntaxStub()
          .withCommonCodeParts('common-part1', 'common-part2')),
      },
      {
        testName: 'comments: does not when lines start with comment',
        codeLines: ['#abc', '#abc', 'abc', 'unique', 'abc', '//abc', '//abc', '//unique', '#unique'],
        expected: expectInvalidCodeLines([3, 5]),
        sut: new NoDuplicatedLines(new LanguageSyntaxStub()
          .withCommentDelimiters('#', '//')),
      },
      {
        testName: 'comments: does when comments come after lien start',
        codeLines: ['test #comment', 'test #comment', 'test2 # comment', 'test2 # comment'],
        expected: expectInvalidCodeLines([1, 2], [3, 4]),
        sut: new NoDuplicatedLines(new LanguageSyntaxStub()
          .withCommentDelimiters('#')),
      },
    ]);
  });
});

function expectInvalidCodeLines(
  ...lines: readonly ReadonlyArray<number>[]
): IInvalidCodeLine[] {
  return lines.flatMap((occurrenceIndices): readonly IInvalidCodeLine[] => occurrenceIndices
    .map((index): IInvalidCodeLine => ({
      index,
      error: `Line is duplicated at line numbers ${occurrenceIndices.join(',')}.`,
    })));
}
