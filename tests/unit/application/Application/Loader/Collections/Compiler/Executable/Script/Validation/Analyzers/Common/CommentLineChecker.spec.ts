import { describe, it } from 'vitest';
import { LanguageSyntaxStub } from '@tests/unit/shared/Stubs/LanguageSyntaxStub';
import { isCommentLine, type CommentLineChecker } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Validation/Analyzers/Common/CommentLineChecker';
import type { LanguageSyntax } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Validation/Analyzers/Syntax/LanguageSyntax';

describe('CommentLineChecker', () => {
  describe('isCommentLine', () => {
    interface CommentLineTestScenario {
      readonly description: string;
      readonly expectedResult: boolean;
      readonly line: string;
      readonly commentDelimiters: readonly string[];
    }
    const testScenarios: readonly CommentLineTestScenario[] = [
      {
        description: 'returns true for line starting with single character comment',
        expectedResult: true,
        line: '#test',
        commentDelimiters: ['#'],
      },
      {
        description: 'returns true for line with only comment and whitespace',
        expectedResult: true,
        line: '# ',
        commentDelimiters: ['#'],
      },
      {
        description: 'returns true for multi-character comment prefix',
        expectedResult: true,
        line: 'delimiter code',
        commentDelimiters: ['delimiter'],
      },
      {
        description: 'returns true for line with only comment delimiter',
        expectedResult: true,
        line: '//',
        commentDelimiters: ['//'],
      },
      {
        description: 'returns true when matching any configured delimiter',
        expectedResult: true,
        line: '// test',
        commentDelimiters: ['#', '//'],
      },
      {
        description: 'return true for case-sensitive delimiters',
        expectedResult: true,
        line: 'REM this is still a comment',
        commentDelimiters: ['rem'],
      },
      {
        description: 'returns false for line without comment prefix',
        expectedResult: false,
        line: 'test',
        commentDelimiters: ['#', '//'],
      },
      {
        description: 'returns false when comment appears mid-line',
        expectedResult: false,
        line: 'test // code',
        commentDelimiters: ['//'],
      },
      {
        description: 'returns false when comment appears at end',
        expectedResult: false,
        line: 'code //',
        commentDelimiters: ['//'],
      },
      {
        description: 'returns false for line starting with whitespace',
        expectedResult: false,
        line: ' // code',
        commentDelimiters: ['//'],
      },
      {
        description: 'returns false when input contains partial delimiter',
        expectedResult: false,
        line: '// code',
        commentDelimiters: ['///'],
      },
      {
        description: 'returns false when no delimiters are configured',
        expectedResult: false,
        line: '// code',
        commentDelimiters: [],
      },
      {
        description: 'returns false for empty line',
        expectedResult: false,
        line: '',
        commentDelimiters: ['#', '//'],
      },
    ];
    testScenarios.forEach((scenario) => {
      it(scenario.description, () => {
        // arrange
        const { expectedResult } = scenario;
        const context = new TestContext()
          .withLine(scenario.line)
          .withSyntax(new LanguageSyntaxStub()
            .withCommentDelimiters(...scenario.commentDelimiters));
        // act
        const actualResult = context.check();
        // assert
        expect(actualResult).to.equal(expectedResult);
      });
    });
  });
});

export class TestContext {
  private codeLine = `[${TestContext}] test code line`;

  private syntax: LanguageSyntax = new LanguageSyntaxStub();

  public withLine(codeLine: string): this {
    this.codeLine = codeLine;
    return this;
  }

  public withSyntax(syntax: LanguageSyntax): this {
    this.syntax = syntax;
    return this;
  }

  public check(): ReturnType<CommentLineChecker> {
    return isCommentLine(
      this.codeLine,
      this.syntax,
    );
  }
}
