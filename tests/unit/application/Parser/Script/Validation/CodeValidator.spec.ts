import { describe, it, expect } from 'vitest';
import { CodeValidator } from '@/application/Parser/Script/Validation/CodeValidator';
import { CodeValidationRuleStub } from '@tests/unit/shared/Stubs/CodeValidationRuleStub';
import { itEachAbsentCollectionValue, itEachAbsentStringValue } from '@tests/unit/shared/TestCases/AbsentTests';
import { itIsSingleton } from '@tests/unit/shared/TestCases/SingletonTests';
import type { ICodeLine } from '@/application/Parser/Script/Validation/ICodeLine';
import type { ICodeValidationRule, IInvalidCodeLine } from '@/application/Parser/Script/Validation/ICodeValidationRule';

describe('CodeValidator', () => {
  describe('instance', () => {
    itIsSingleton({
      getter: () => CodeValidator.instance,
      expectedType: CodeValidator,
    });
  });
  describe('throwIfInvalid', () => {
    describe('does not throw if code is absent', () => {
      itEachAbsentStringValue((absentValue) => {
        // arrange
        const code = absentValue;
        const sut = new CodeValidator();
        // act
        const act = () => sut.throwIfInvalid(code, [new CodeValidationRuleStub()]);
        // assert
        expect(act).to.not.throw();
      }, { excludeNull: true, excludeUndefined: true });
    });
    describe('throws if rules are empty', () => {
      itEachAbsentCollectionValue<ICodeValidationRule>((absentValue) => {
        // arrange
        const expectedError = 'missing rules';
        const rules = absentValue;
        const sut = new CodeValidator();
        // act
        const act = () => sut.throwIfInvalid('code', rules);
        // assert
        expect(act).to.throw(expectedError);
      }, { excludeUndefined: true, excludeNull: true });
    });
    describe('splits lines as expected', () => {
      it('supports all line separators', () => {
        // arrange
        const expectedLineTexts = ['line1', 'line2', 'line3', 'line4'];
        const code = 'line1\r\nline2\rline3\nline4';
        const spy = new CodeValidationRuleStub();
        const sut = new CodeValidator();
        // act
        sut.throwIfInvalid(code, [spy]);
        // expect
        expect(spy.receivedLines).has.lengthOf(1);
        const actualLineTexts = spy.receivedLines[0].map((line) => line.text);
        expect(actualLineTexts).to.deep.equal(expectedLineTexts);
      });
      it('uses 1-indexed line numbering', () => {
        // arrange
        const expectedIndexes = [1, 2, 3];
        const code = ['line1', 'line2', 'line3'].join('\n');
        const spy = new CodeValidationRuleStub();
        const sut = new CodeValidator();
        // act
        sut.throwIfInvalid(code, [spy]);
        // expect
        expect(spy.receivedLines).has.lengthOf(1);
        const actualLineIndexes = spy.receivedLines[0].map((line) => line.index);
        expect(actualLineIndexes).to.deep.equal(expectedIndexes);
      });
      it('matches texts with indexes as expected', () => {
        // arrange
        const expected: readonly ICodeLine[] = [
          { index: 1, text: 'first' },
          { index: 2, text: 'second' },
        ];
        const code = expected.map((line) => line.text).join('\n');
        const spy = new CodeValidationRuleStub();
        const sut = new CodeValidator();
        // act
        sut.throwIfInvalid(code, [spy]);
        // expect
        expect(spy.receivedLines).has.lengthOf(1);
        expect(spy.receivedLines[0]).to.deep.equal(expected);
      });
    });
    describe('throws invalid lines as expected', () => {
      it('throws with invalid line from single rule', () => {
        // arrange
        const errorText = 'error';
        const expectedError = new ExpectedErrorBuilder()
          .withOkLine('line1')
          .withErrorLine('line2', errorText)
          .withOkLine('line3')
          .withOkLine('line4')
          .buildError();
        const code = ['line1', 'line2', 'line3', 'line4'].join('\n');
        const invalidLines: readonly IInvalidCodeLine[] = [
          { index: 2, error: errorText },
        ];
        const rule = new CodeValidationRuleStub()
          .withReturnValue(invalidLines);
        const noopRule = new CodeValidationRuleStub()
          .withReturnValue([]);
        const sut = new CodeValidator();
        // act
        const act = () => sut.throwIfInvalid(code, [rule, noopRule]);
        // assert
        expect(act).to.throw(expectedError);
      });
      it('throws with combined invalid lines from multiple rules', () => {
        // arrange
        const firstError = 'firstError';
        const secondError = 'firstError';
        const expectedError = new ExpectedErrorBuilder()
          .withOkLine('line1')
          .withErrorLine('line2', firstError)
          .withOkLine('line3')
          .withErrorLine('line4', secondError)
          .buildError();
        const code = ['line1', 'line2', 'line3', 'line4'].join('\n');
        const firstRuleError: readonly IInvalidCodeLine[] = [
          { index: 2, error: firstError },
        ];
        const secondRuleError: readonly IInvalidCodeLine[] = [
          { index: 4, error: secondError },
        ];
        const firstRule = new CodeValidationRuleStub().withReturnValue(firstRuleError);
        const secondRule = new CodeValidationRuleStub().withReturnValue(secondRuleError);
        const sut = new CodeValidator();
        // act
        const act = () => sut.throwIfInvalid(code, [firstRule, secondRule]);
        // assert
        expect(act).to.throw(expectedError);
      });
    });
  });
});

class ExpectedErrorBuilder {
  private lineCount = 0;

  private outputLines = new Array<string>();

  public withOkLine(text: string) {
    return this.withNumberedLine(`✅ ${text}`);
  }

  public withErrorLine(text: string, error: string) {
    return this
      .withNumberedLine(`❌ ${text}`)
      .withLine(`\t⟶ ${error}`);
  }

  public buildError(): string {
    return [
      'Errors with the code.',
      ...this.outputLines,
    ].join('\n');
  }

  private withLine(line: string) {
    this.outputLines.push(line);
    return this;
  }

  private withNumberedLine(text: string) {
    this.lineCount += 1;
    const lineNumber = `[${this.lineCount}]`;
    return this.withLine(`${lineNumber} ${text}`);
  }
}
