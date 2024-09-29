import { it, expect } from 'vitest';
import type { Pipe } from '@/application/Parser/Executable/Script/Compiler/Expressions/Pipes/Pipe';
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';
import { indentText } from '@/application/Common/Text/IndentText';

export interface PipeTestScenario {
  readonly description: string;
  readonly input: string;
  readonly expectedOutput: RegExp | string;
}

export function runPipeTests(
  pipe: Pipe,
  testScenarios: readonly PipeTestScenario[],
) {
  testScenarios.forEach((
    { input, description, expectedOutput: expectedInlinedOutput },
  ) => {
    it(description, () => {
      // act
      const actualOutput = pipe.apply(input);
      // assert
      if (typeof expectedInlinedOutput === 'string') {
        expect(actualOutput).to.equal(expectedInlinedOutput);
      } else {
        expect(actualOutput).to.match(expectedInlinedOutput, formatAssertionMessage([
          'Regex did not match the output.',
          'Expected regex pattern:',
          indentText(expectedInlinedOutput.toString()),
          'Actual output:',
          indentText(actualOutput),
          'Given input:',
          indentText(input),
        ]));
      }
    });
  });
}

export class RegexBuilder {
  private rawRegex: string = '';

  public withLiteralString(string: string): this {
    this.rawRegex += string.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
    return this;
  }

  public withSomeWhitespaceButNoNewLine(): this {
    this.rawRegex += '[ \\t\\f]+';
    return this;
  }

  public withOptionalWhitespaceButNoNewline(): this {
    this.rawRegex += '[ \\t\\f]*';
    return this;
  }

  public withOptionalSemicolon(): this {
    this.rawRegex += ';?';
    return this;
  }

  public withSemicolon(): this {
    this.rawRegex += ';';
    return this;
  }

  public buildRegex(): RegExp {
    return new RegExp(this.rawRegex, 'g');
  }
}
