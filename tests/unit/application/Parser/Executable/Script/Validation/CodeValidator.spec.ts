import { describe, it, expect } from 'vitest';
import { CodeValidationAnalyzerStub } from '@tests/unit/shared/Stubs/CodeValidationAnalyzerStub';
import { itEachAbsentStringValue } from '@tests/unit/shared/TestCases/AbsentTests';
import { indentText } from '@/application/Common/Text/IndentText';
import type { CodeLine, InvalidCodeLine } from '@/application/Parser/Executable/Script/Validation/Analyzers/CodeValidationAnalyzer';
import { validateCode } from '@/application/Parser/Executable/Script/Validation/CodeValidator';
import { ScriptLanguage } from '@/domain/ScriptMetadata/ScriptLanguage';
import { CodeValidationRule } from '@/application/Parser/Executable/Script/Validation/CodeValidationRule';
import type { ValidationRuleAnalyzerFactory } from '@/application/Parser/Executable/Script/Validation/ValidationRuleAnalyzerFactory';

describe('validateCode', () => {
  describe('does not throw if code is absent', () => {
    itEachAbsentStringValue((absentValue) => {
      // arrange
      const code = absentValue;
      // act
      const act = () => new TestContext()
        .withCode(code)
        .validate();
      // assert
      expect(act).to.not.throw();
    }, { excludeNull: true, excludeUndefined: true });
  });
  describe('line splitting', () => {
    it('supports all line separators', () => {
      // arrange
      const expectedLineTexts = ['line1', 'line2', 'line3', 'line4'];
      const code = 'line1\r\nline2\rline3\nline4';
      const analyzer = new CodeValidationAnalyzerStub();
      const analyzerFactory: ValidationRuleAnalyzerFactory = () => [analyzer.get()];
      // act
      new TestContext()
        .withCode(code)
        .withAnalyzerFactory(analyzerFactory)
        .validate();
      // expect
      expect(analyzer.receivedLines).has.lengthOf(1);
      const actualLineTexts = analyzer.receivedLines[0].map((line) => line.text);
      expect(actualLineTexts).to.deep.equal(expectedLineTexts);
    });
    it('uses 1-indexed line numbering', () => {
      // arrange
      const expectedLineNumbers = [1, 2, 3];
      const code = ['line1', 'line2', 'line3'].join('\n');
      const analyzer = new CodeValidationAnalyzerStub();
      const analyzerFactory: ValidationRuleAnalyzerFactory = () => [analyzer.get()];
      // act
      new TestContext()
        .withCode(code)
        .withAnalyzerFactory(analyzerFactory)
        .validate();
      // expect
      expect(analyzer.receivedLines).has.lengthOf(1);
      const actualLineIndexes = analyzer.receivedLines[0].map((line) => line.lineNumber);
      expect(actualLineIndexes).to.deep.equal(expectedLineNumbers);
    });
    it('includes empty lines in count', () => {
      // arrange
      const expectedEmptyLineCount = 4;
      const code = '\n'.repeat(expectedEmptyLineCount - 1);
      const analyzer = new CodeValidationAnalyzerStub();
      const analyzerFactory: ValidationRuleAnalyzerFactory = () => [analyzer.get()];
      // act
      new TestContext()
        .withCode(code)
        .withAnalyzerFactory(analyzerFactory)
        .validate();
      // expect
      expect(analyzer.receivedLines).has.lengthOf(1);
      const actualLines = analyzer.receivedLines[0];
      expect(actualLines).to.have.lengthOf(expectedEmptyLineCount);
    });
    it('correctly matches line numbers with text', () => {
      // arrange
      const expected: readonly CodeLine[] = [
        { lineNumber: 1, text: 'first' },
        { lineNumber: 2, text: 'second' },
      ];
      const code = expected.map((line) => line.text).join('\n');
      const analyzer = new CodeValidationAnalyzerStub();
      const analyzerFactory: ValidationRuleAnalyzerFactory = () => [analyzer.get()];
      // act
      new TestContext()
        .withCode(code)
        .withAnalyzerFactory(analyzerFactory)
        .validate();
      // expect
      expect(analyzer.receivedLines).has.lengthOf(1);
      expect(analyzer.receivedLines[0]).to.deep.equal(expected);
    });
  });
  it('analyzes lines for correct language', () => {
    // arrange
    const expectedLanguage = ScriptLanguage.batchfile;
    const analyzers = [
      new CodeValidationAnalyzerStub(),
      new CodeValidationAnalyzerStub(),
      new CodeValidationAnalyzerStub(),
    ];
    const analyzerFactory: ValidationRuleAnalyzerFactory = () => analyzers.map((s) => s.get());
    // act
    new TestContext()
      .withAnalyzerFactory(analyzerFactory)
      .validate();
    // assert
    const actualLanguages = analyzers.flatMap((a) => a.receivedLanguages);
    const unexpectedLanguages = actualLanguages.filter((l) => l !== expectedLanguage);
    expect(unexpectedLanguages).to.have.lengthOf(0);
  });
  describe('throwing invalid lines', () => {
    it('throws error for invalid line from single rule', () => {
      // arrange
      const errorText = 'error';
      const expectedError = constructExpectedValidationErrorMessage([
        { text: 'line1' },
        { text: 'line2', error: errorText },
        { text: 'line3' },
        { text: 'line4' },
      ]);
      const code = ['line1', 'line2', 'line3', 'line4'].join('\n');
      const invalidLines: readonly InvalidCodeLine[] = [
        { lineNumber: 2, error: errorText },
      ];
      const invalidAnalyzer = new CodeValidationAnalyzerStub()
        .withReturnValue(invalidLines);
      const noopAnalyzer = new CodeValidationAnalyzerStub()
        .withReturnValue([]);
      const analyzerFactory: ValidationRuleAnalyzerFactory = () => [
        invalidAnalyzer, noopAnalyzer,
      ].map((s) => s.get());
      // act
      const act = () => new TestContext()
        .withCode(code)
        .withAnalyzerFactory(analyzerFactory)
        .validate();
      // assert
      expect(act).to.throw(expectedError);
    });
    it('throws error with combined invalid lines from multiple rules', () => {
      // arrange
      const firstError = 'firstError';
      const secondError = 'firstError';
      const expectedError = constructExpectedValidationErrorMessage([
        { text: 'line1' },
        { text: 'line2', error: firstError },
        { text: 'line3' },
        { text: 'line4', error: secondError },
      ]);
      const code = ['line1', 'line2', 'line3', 'line4'].join('\n');
      const firstRuleError: readonly InvalidCodeLine[] = [
        { lineNumber: 2, error: firstError },
      ];
      const secondRuleError: readonly InvalidCodeLine[] = [
        { lineNumber: 4, error: secondError },
      ];
      const firstRule = new CodeValidationAnalyzerStub().withReturnValue(firstRuleError);
      const secondRule = new CodeValidationAnalyzerStub().withReturnValue(secondRuleError);
      const analyzerFactory: ValidationRuleAnalyzerFactory = () => [
        firstRule, secondRule,
      ].map((s) => s.get());
      // act
      const act = () => new TestContext()
        .withCode(code)
        .withAnalyzerFactory(analyzerFactory)
        .validate();
      // assert
      expect(act).to.throw(expectedError);
    });
  });
});

function constructExpectedValidationErrorMessage(
  lines: readonly {
    readonly text: string,
    readonly error?: string,
  }[],
): string {
  return [
    'Errors with the code.',
    ...lines.flatMap((line, index): string[] => {
      const textPrefix = line.error ? '❌' : '✅';
      const lineNumber = `[${index + 1}]`;
      const formattedLine = `${lineNumber} ${textPrefix} ${line.text}`;
      return [
        formattedLine,
        ...(line.error ? [indentText(`⟶ ${line.error}`)] : []),
      ];
    }),
  ].join('\n');
}

class TestContext {
  private code = `[${TestContext.name}] code`;

  private language: ScriptLanguage = ScriptLanguage.batchfile;

  private rules: readonly CodeValidationRule[] = [CodeValidationRule.NoDuplicatedLines];

  private analyzerFactory: ValidationRuleAnalyzerFactory = () => [
    new CodeValidationAnalyzerStub().get(),
  ];

  public withCode(code: string): this {
    this.code = code;
    return this;
  }

  public withRules(rules: readonly CodeValidationRule[]): this {
    this.rules = rules;
    return this;
  }

  public withAnalyzerFactory(analyzerFactory: ValidationRuleAnalyzerFactory): this {
    this.analyzerFactory = analyzerFactory;
    return this;
  }

  public validate(): ReturnType<typeof validateCode> {
    return validateCode(
      this.code,
      this.language,
      this.rules,
      this.analyzerFactory,
    );
  }
}
