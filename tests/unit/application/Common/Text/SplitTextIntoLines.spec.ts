import { describe, it, expect } from 'vitest';
import { splitTextIntoLines } from '@/application/Common/Text/SplitTextIntoLines';
import type { isString } from '@/TypeHelpers';
import { IsStringStub } from '@tests/unit/shared/Stubs/IsStringStub';

describe('splitTextIntoLines', () => {
  describe('splits correctly', () => {
    // arrange
    const testScenarios: readonly {
      readonly description: string;
      readonly text: string;
      readonly expectedLines: readonly string[];
    } [] = [
      {
        description: 'handles Unix-like line separator',
        text: 'Hello\nWorld\nTest',
        expectedLines: ['Hello', 'World', 'Test'],
      },
      {
        description: 'handles Windows line separator',
        text: 'Hello\r\nWorld\r\nTest',
        expectedLines: ['Hello', 'World', 'Test'],
      },
      {
        description: 'handles mixed indentation (both Unix-like and Windows)',
        text: 'Hello\r\nWorld\nTest',
        expectedLines: ['Hello', 'World', 'Test'],
      },
      {
        description: 'returns an array with one element when no new lines',
        text: 'Hello World',
        expectedLines: ['Hello World'],
      },
      {
        description: 'preserves empty lines between text lines',
        text: 'Hello\n\nWorld\n\n\nTest\n',
        expectedLines: ['Hello', '', 'World', '', '', 'Test', ''],
      },
      {
        description: 'handles empty strings',
        text: '',
        expectedLines: [''],
      },
    ];
    testScenarios.forEach(({
      description, text, expectedLines,
    }) => {
      it(description, () => {
        const testContext = new TestContext()
          .withText(text);
        // act
        const result = testContext.splitText();
        // assert
        expect(result).to.deep.equal(expectedLines);
      });
    });
  });
  it('checks for string type', () => {
    // arrange
    const invalidInput = 42;
    const errorMessage = `Line splitting error: Expected a string but received type '${typeof invalidInput}'.`;
    const isString = new IsStringStub()
      .withPredeterminedResult(false)
      .get();
    // act
    const act = () => new TestContext()
      .withText(invalidInput as unknown as string)
      .withIsStringType(isString)
      .splitText();
    // assert
    expect(act).to.throw(errorMessage);
  });
});

class TestContext {
  private isStringType: typeof isString = new IsStringStub().get();

  private text: string = `[${TestContext.name}] text value`;

  public withText(text: string): this {
    this.text = text;
    return this;
  }

  public withIsStringType(isStringType: typeof isString): this {
    this.isStringType = isStringType;
    return this;
  }

  public splitText(): ReturnType<typeof splitTextIntoLines> {
    return splitTextIntoLines(
      this.text,
      this.isStringType,
    );
  }
}
