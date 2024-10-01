import { describe } from 'vitest';
import type { CodeLine, InvalidCodeLine } from '@/application/Parser/Executable/Script/Validation/Analyzers/CodeValidationAnalyzer';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { analyzeTooLongLines } from '@/application/Parser/Executable/Script/Validation/Analyzers/AnalyzeTooLongLines';
import { createCodeLines } from './CreateCodeLines';
import { expectInvalidCodeLines, expectSameInvalidCodeLines } from './ExpectSameInvalidCodeLines';

describe('AnalyzeTooLongLines', () => {
  describe('analyzeTooLongLines', () => {
    describe('returns no results for lines within the maximum length', () => {
      createScriptLanguageScenarios().forEach((scenario) => {
        it(scenario.description, () => {
          // arrange
          const expected: InvalidCodeLine[] = [];
          const context = new TestContext()
            .withLanguage(scenario.language)
            .withLines([
              'A'.repeat(scenario.maxLength),
              'B'.repeat(scenario.maxLength - 1),
              'C'.repeat(100),
            ]);
          // act
          const actual = context.analyze();
          // assert
          expectSameInvalidCodeLines(actual, expected);
        });
      });
    });

    describe('identifies a single line exceeding maximum length', () => {
      createScriptLanguageScenarios().forEach((scenario) => {
        it(scenario.description, () => {
          // arrange
          const expectedLength = scenario.maxLength + 1;
          const expectedLineNumber = 2;
          const context = new TestContext()
            .withLanguage(scenario.language)
            .withLines([
              'A'.repeat(scenario.maxLength),
              'B'.repeat(expectedLength),
              'C'.repeat(100),
            ]);
          // act
          const actual = context.analyze();
          // assert
          expectInvalidCodeLines(actual, [expectedLineNumber]);
        });
      });
    });

    describe('identifies multiple lines exceeding maximum length', () => {
      createScriptLanguageScenarios().forEach((scenario) => {
        it(scenario.description, () => {
          // arrange
          const expectedInvalidLines: readonly {
            readonly lineNumber: number,
            readonly length: number,
          }[] = [
            { lineNumber: 1, length: scenario.maxLength + 1 },
            { lineNumber: 3, length: scenario.maxLength + 2 },
          ];
          const context = new TestContext()
            .withLanguage(scenario.language)
            .withLines([
              'A'.repeat(expectedInvalidLines[0].length),
              'B'.repeat(scenario.maxLength),
              'C'.repeat(expectedInvalidLines[1].length),
            ]);
          // act
          const actual = context.analyze();
          // assert
          expectInvalidCodeLines(actual, expectedInvalidLines.map((l) => l.lineNumber));
        });
      });
    });

    describe('error construction', () => {
      describe('outputs actual character length', () => {
        createScriptLanguageScenarios().forEach((scenario) => {
          it(scenario.description, () => {
            // arrange
            const expectedLength = scenario.maxLength + 1;
            const expectedErrorPart = `Line is too long (${expectedLength}).`;
            const context = new TestContext()
              .withLanguage(scenario.language)
              .withLines([
                'B'.repeat(expectedLength),
              ]);
            // act
            const actual = context.analyze();
            // assert
            expect(actual).to.have.lengthOf(1);
            const actualError = actual[0].error;
            expect(actualError).to.include(expectedErrorPart);
          });
        });
      });
      describe('outputs maximum allowed character length', () => {
        createScriptLanguageScenarios().forEach((scenario) => {
          it(scenario.description, () => {
            // arrange
            const expectedLength = scenario.maxLength + 1;
            const expectedErrorPart = `It exceed maximum allowed length ${scenario.maxLength}`;
            const context = new TestContext()
              .withLanguage(scenario.language)
              .withLines([
                'B'.repeat(expectedLength),
              ]);
            // act
            const actual = context.analyze();
            // assert
            expect(actual).to.have.lengthOf(1);
            const actualError = actual[0].error;
            expect(actualError).to.include(expectedErrorPart);
          });
        });
      });
      describe('outputs total exceeding characters', () => {
        createScriptLanguageScenarios().forEach((scenario) => {
          it(scenario.description, () => {
            // arrange
            const expectedExceedingCharacters = 5;
            const expectedErrorPart = `by ${expectedExceedingCharacters} characters.`;
            const lineLength = scenario.maxLength + expectedExceedingCharacters;
            const context = new TestContext()
              .withLanguage(scenario.language)
              .withLines([
                'B'.repeat(lineLength),
              ]);
            // act
            const actual = context.analyze();
            // assert
            expect(actual).to.have.lengthOf(1);
            const actualError = actual[0].error;
            expect(actualError).to.include(expectedErrorPart);
          });
        });
      });
    });

    it('throws an error for unsupported language', () => {
      // arrange
      const unsupportedLanguage = 'unsupported' as unknown as ScriptingLanguage;
      const expectedError = `Unsupported language: ${ScriptingLanguage[unsupportedLanguage]} (${unsupportedLanguage})`;
      const context = new TestContext()
        .withLanguage('unsupported' as unknown as ScriptingLanguage)
        .withLines(['A', 'B', 'C']);
      // act
      const act = () => context.analyze();
      // assert
      expect(act).to.throw(expectedError);
    });
  });
});

interface ScriptLanguageScenario {
  readonly description: string;
  readonly maxLength: number;
  readonly language: ScriptingLanguage;
}

function createScriptLanguageScenarios(): readonly ScriptLanguageScenario[] {
  const maxLengths: Record< // `Record` catches missing entries at compile-time
  ScriptingLanguage, number> = {
    [ScriptingLanguage.batchfile]: 8191,
    [ScriptingLanguage.shellscript]: 1048576,
  };
  return Object.entries(maxLengths).map(([language, length]): ScriptLanguageScenario => {
    const languageValue = Number.parseInt(language, 10) as ScriptingLanguage;
    return {
      description: `${ScriptingLanguage[languageValue]} (max: ${length})`,
      language: languageValue,
      maxLength: length,
    };
  });
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
