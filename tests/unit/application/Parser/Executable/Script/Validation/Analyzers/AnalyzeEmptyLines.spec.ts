import { describe } from 'vitest';
import { analyzeEmptyLines } from '@/application/Parser/Executable/Script/Validation/Analyzers/AnalyzeEmptyLines';
import type { CodeLine, InvalidCodeLine } from '@/application/Parser/Executable/Script/Validation/Analyzers/CodeValidationAnalyzer';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { createCodeLines } from './CreateCodeLines';
import { expectSameInvalidCodeLines } from './ExpectSameInvalidCodeLines';

describe('AnalyzeEmptyLines', () => {
  describe('analyzeEmptyLines', () => {
    it('returns no results for non-empty lines', () => {
      // arrange
      const expected: InvalidCodeLine[] = [];
      const context = new TestContext()
        .withLines([
          /* 1 */ 'non-empty-line1', /* 2 */ 'none-empty-line2',
        ]);
      // act
      const actual = context.analyze();
      // assert
      expectSameInvalidCodeLines(actual, expected);
    });
    it('identifies single empty line', () => {
      // arrange
      const expected: InvalidCodeLine[] = [
        { lineNumber: 2, error: 'Empty line' },
      ];
      const context = new TestContext()
        .withLines([
          /* 1 */ 'first line', /* 2 */ '', /* 3 */ 'third line',
        ]);
      // act
      const actual = context.analyze();
      // assert
      expectSameInvalidCodeLines(actual, expected);
    });
    it('identifies multiple empty lines', () => {
      // arrange
      const expected: InvalidCodeLine[] = [2, 4].map((index): InvalidCodeLine => ({ lineNumber: index, error: 'Empty line' }));
      const context = new TestContext()
        .withLines([
          /* 1 */ 'first line', /* 2 */ '', /* 3 */ 'third line', /* 4 */ '',
        ]);
      // act
      const actual = context.analyze();
      // assert
      expectSameInvalidCodeLines(actual, expected);
    });
    it('identifies lines with only spaces', () => {
      // arrange
      const expected: InvalidCodeLine[] = [
        { lineNumber: 2, error: 'Empty line: "{whitespace}{whitespace}"' },
      ];
      const context = new TestContext()
        .withLines([
          /* 1 */ 'first line', /* 2 */ '  ', /* 3 */ 'third line',
        ]);
      // act
      const actual = context.analyze();
      // assert
      expectSameInvalidCodeLines(actual, expected);
    });
    it('identifies lines with only tabs', () => {
      // arrange
      const expected: InvalidCodeLine[] = [
        { lineNumber: 2, error: 'Empty line: "{tab}{tab}"' },
      ];
      const context = new TestContext()
        .withLines([
          /* 1 */ 'first line', /* 2 */ '\t\t', /* 3 */ 'third line',
        ]);
      // act
      const actual = context.analyze();
      // assert
      expectSameInvalidCodeLines(actual, expected);
    });
    it('identifies lines with mixed spaces and tabs', () => {
      // arrange
      const expected: InvalidCodeLine[] = [
        { lineNumber: 2, error: 'Empty line: "{tab}{whitespace}{tab}"' },
        { lineNumber: 4, error: 'Empty line: "{whitespace}{tab}{whitespace}"' },
      ];
      const context = new TestContext()
        .withLines([
          /* 1 */ 'first line', /* 2 */ '\t \t', /* 3 */ 'third line', /* 4 */ ' \t ',
        ]);
      // act
      const actual = context.analyze();
      // assert
      expectSameInvalidCodeLines(actual, expected);
    });
  });
});

export class TestContext {
  private codeLines: readonly CodeLine[] = createCodeLines(['test-code-line']);

  private language = ScriptingLanguage.batchfile;

  public withLines(lines: readonly string[]): this {
    this.codeLines = createCodeLines(lines);
    return this;
  }

  public withLanguage(language: ScriptingLanguage): this {
    this.language = language;
    return this;
  }

  public analyze() {
    return analyzeEmptyLines(
      this.codeLines,
      this.language,
    );
  }
}
