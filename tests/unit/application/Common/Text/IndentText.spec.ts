import { describe, it, expect } from 'vitest';
import { indentText } from '@/application/Common/Text/IndentText';
import { IsStringStub } from '@tests/unit/shared/Stubs/IsStringStub';
import type { isString } from '@/TypeHelpers';

type IndentLevel = Parameters<typeof indentText>['1'];

const TestLineSeparator = '[TEST-LINE-SEPARATOR]';

describe('indentText', () => {
  describe('text indentation', () => {
    const testScenarios: readonly {
      readonly description: string;
      readonly text: string;
      readonly indentLevel: IndentLevel;
      readonly expected: string;
    }[] = [
      {
        description: 'indents multiple lines with single tab',
        text: createMultilineTestInput('Hello', 'World', 'Test'),
        indentLevel: 1,
        expected: '\tHello\n\tWorld\n\tTest',
      },
      {
        description: 'indents multiple lines with two tabs',
        text: createMultilineTestInput('Hello', 'World', 'Test'),
        indentLevel: 2,
        expected: '\t\tHello\n\t\tWorld\n\t\tTest',
      },
      {
        description: 'indents single line with one tab',
        text: 'Hello World',
        indentLevel: 1,
        expected: '\tHello World',
      },
      {
        description: 'preserves empty string without indentation',
        text: '',
        indentLevel: 1,
        expected: '',
      },
      {
        description: 'defaults to one tab when indent level is unspecified',
        text: createMultilineTestInput('Hello', 'World'),
        indentLevel: undefined,
        expected: '\tHello\n\tWorld',
      },
    ];
    testScenarios.forEach(({
      description, text, indentLevel, expected,
    }) => {
      it(description, () => {
        const context = new TextContext()
          .withText(text)
          .withIndentLevel(indentLevel);
        // act
        const actualText = context.indentText();
        // assert
        expect(actualText).to.equal(expected);
      });
    });
  });

  describe('error handling', () => {
    it('throws for non-string input', () => {
      // arrange
      const invalidInput = 42;
      const expectedErrorMessage = `Indentation error: The input must be a string. Received type: ${typeof invalidInput}.`;
      const isString = new IsStringStub()
        .withPredeterminedResult(false)
        .get();
      const context = new TextContext()
        .withText(invalidInput as unknown as string /* bypass compiler checks */)
        .withIsStringType(isString);
      // act
      const act = () => context.indentText();
      // assert
      expect(act).toThrow(expectedErrorMessage);
    });
    it('throws for indentation level below one', () => {
      // arrange
      const indentLevel = 0;
      const expectedErrorMessage = `Indentation error: The indent level must be a positive integer. Received: ${indentLevel}.`;
      const context = new TextContext()
        .withIndentLevel(indentLevel);
      // act
      const act = () => context.indentText();
      // assert
      expect(act).toThrow(expectedErrorMessage);
    });
  });
});

function createMultilineTestInput(...lines: readonly string[]): string {
  return lines.join(TestLineSeparator);
}

class TextContext {
  private text = `[${TextContext.name}] text to indent`;

  private indentLevel: IndentLevel = undefined;

  private isStringType: typeof isString = new IsStringStub().get();

  public withText(text: string): this {
    this.text = text;
    return this;
  }

  public withIndentLevel(indentLevel: IndentLevel): this {
    this.indentLevel = indentLevel;
    return this;
  }

  public withIsStringType(isStringType: typeof isString): this {
    this.isStringType = isStringType;
    return this;
  }

  public indentText(): ReturnType<typeof indentText> {
    return indentText(
      this.text,
      this.indentLevel,
      {
        splitIntoLines: (text) => text.split(TestLineSeparator),
        isStringType: this.isStringType,
      },
    );
  }
}
