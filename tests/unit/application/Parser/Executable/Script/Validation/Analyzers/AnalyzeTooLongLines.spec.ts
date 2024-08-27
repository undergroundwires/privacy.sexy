import { describe } from 'vitest';
import type { CodeLine, InvalidCodeLine } from '@/application/Parser/Executable/Script/Validation/Analyzers/CodeValidationAnalyzer';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { analyzeTooLongLines } from '@/application/Parser/Executable/Script/Validation/Analyzers/AnalyzeTooLongLines';
import { createCodeLines } from './CreateCodeLines';
import { expectSameInvalidCodeLines } from './ExpectSameInvalidCodeLines';

describe('AnalyzeTooLongLines', () => {
  describe('analyzeTooLongLines', () => {
    describe('batchfile', () => {
      const MAX_BATCHFILE_LENGTH = 8191;

      it('returns no results for lines within the maximum length', () => {
        // arrange
        const expected: InvalidCodeLine[] = [];
        const context = new TestContext()
          .withLanguage(ScriptingLanguage.batchfile)
          .withLines([
            'A'.repeat(MAX_BATCHFILE_LENGTH),
            'B'.repeat(8000),
            'C'.repeat(100),
          ]);
        // act
        const actual = context.analyze();
        // assert
        expectSameInvalidCodeLines(actual, expected);
      });

      it('identifies a single line exceeding maximum length', () => {
        // arrange
        const expectedLength = MAX_BATCHFILE_LENGTH + 1;
        const expected: InvalidCodeLine[] = [{
          lineNumber: 2,
          error: createTooLongLineError(expectedLength, MAX_BATCHFILE_LENGTH),
        }];
        const context = new TestContext()
          .withLanguage(ScriptingLanguage.batchfile)
          .withLines([
            'A'.repeat(MAX_BATCHFILE_LENGTH),
            'B'.repeat(expectedLength),
            'C'.repeat(100),
          ]);
        // act
        const actual = context.analyze();
        // assert
        expectSameInvalidCodeLines(actual, expected);
      });

      it('identifies multiple lines exceeding maximum length', () => {
        // arrange
        const expectedLength1 = MAX_BATCHFILE_LENGTH + 1;
        const expectedLength2 = MAX_BATCHFILE_LENGTH + 2;
        const expected: InvalidCodeLine[] = [
          {
            lineNumber: 1,
            error: createTooLongLineError(expectedLength1, MAX_BATCHFILE_LENGTH),
          },
          {
            lineNumber: 3,
            error: createTooLongLineError(expectedLength2, MAX_BATCHFILE_LENGTH),
          },
        ];
        const context = new TestContext()
          .withLanguage(ScriptingLanguage.batchfile)
          .withLines([
            'A'.repeat(expectedLength1),
            'B'.repeat(MAX_BATCHFILE_LENGTH),
            'C'.repeat(expectedLength2),
          ]);
        // act
        const actual = context.analyze();
        // assert
        expectSameInvalidCodeLines(actual, expected);
      });
    });

    describe('shellscript', () => {
      const MAX_SHELLSCRIPT_LENGTH = 1048576;

      it('returns no results for lines within the maximum length', () => {
        // arrange
        const expected: InvalidCodeLine[] = [];
        const context = new TestContext()
          .withLanguage(ScriptingLanguage.shellscript)
          .withLines([
            'A'.repeat(MAX_SHELLSCRIPT_LENGTH),
            'B'.repeat(1000000),
            'C'.repeat(100),
          ]);
        // act
        const actual = context.analyze();
        // assert
        expectSameInvalidCodeLines(actual, expected);
      });

      it('identifies a single line exceeding maximum length', () => {
        // arrange
        const expectedLength = MAX_SHELLSCRIPT_LENGTH + 1;
        const expected: InvalidCodeLine[] = [{
          lineNumber: 2,
          error: createTooLongLineError(expectedLength, MAX_SHELLSCRIPT_LENGTH),
        }];
        const context = new TestContext()
          .withLanguage(ScriptingLanguage.shellscript)
          .withLines([
            'A'.repeat(MAX_SHELLSCRIPT_LENGTH),
            'B'.repeat(expectedLength),
            'C'.repeat(100),
          ]);
        // act
        const actual = context.analyze();
        // assert
        expectSameInvalidCodeLines(actual, expected);
      });

      it('identifies multiple lines exceeding maximum length', () => {
        // arrange
        const expectedLength1 = MAX_SHELLSCRIPT_LENGTH + 1;
        const expectedLength2 = MAX_SHELLSCRIPT_LENGTH + 2;
        const expected: InvalidCodeLine[] = [
          {
            lineNumber: 1,
            error: createTooLongLineError(expectedLength1, MAX_SHELLSCRIPT_LENGTH),
          },
          {
            lineNumber: 3,
            error: createTooLongLineError(expectedLength2, MAX_SHELLSCRIPT_LENGTH),
          },
        ];
        const context = new TestContext()
          .withLanguage(ScriptingLanguage.shellscript)
          .withLines([
            'A'.repeat(expectedLength1),
            'B'.repeat(MAX_SHELLSCRIPT_LENGTH),
            'C'.repeat(expectedLength2),
          ]);
        // act
        const actual = context.analyze();
        // assert
        expectSameInvalidCodeLines(actual, expected);
      });
    });

    it('throws an error for unsupported language', () => {
      // arrange
      const context = new TestContext()
        .withLanguage('unsupported' as unknown as ScriptingLanguage)
        .withLines(['A', 'B', 'C']);
      // act & assert
      expect(() => context.analyze()).to.throw('Unsupported language: unsupported');
    });
  });
});

function createTooLongLineError(actualLength: number, maxAllowedLength: number): string {
  return [
    `Line is too long (${actualLength}).`,
    `It exceed maximum allowed length ${maxAllowedLength}.`,
    'This may cause bugs due to unintended trimming by operating system, shells or terminal emulators.',
  ].join(' ');
}

class TestContext {
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
    return analyzeTooLongLines(
      this.codeLines,
      this.language,
    );
  }
}
