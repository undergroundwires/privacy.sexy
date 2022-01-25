import 'mocha';
import { expect } from 'chai';
import { ScriptCode, ILanguageSyntax } from '@/domain/ScriptCode';
import { IScriptCode } from '@/domain/IScriptCode';
import { LanguageSyntaxStub } from '@tests/unit/shared/Stubs/LanguageSyntaxStub';
import { AbsentStringTestCases, itEachAbsentObjectValue } from '@tests/unit/shared/TestCases/AbsentTests';

describe('ScriptCode', () => {
  describe('code', () => {
    describe('throws with invalid code', () => {
      // arrange
      const testCases = [
        {
          name: 'throws when "execute" and "revert" are same',
          code: {
            execute: 'same',
            revert: 'same',
          },
          expectedError: '(revert): Code itself and its reverting code cannot be the same',
        },
        ...AbsentStringTestCases.map((testCase) => ({
          name: `cannot construct with ${testCase.valueName} "execute"`,
          code: {
            execute: testCase.absentValue,
            revert: 'code',
          },
          expectedError: 'missing code',
        })),
      ];
      for (const testCase of testCases) {
        it(testCase.name, () => {
          // act
          const act = () => new ScriptCodeBuilder()
            .withExecute(testCase.code.execute)
            .withRevert(testCase.code.revert)
            .build();
          // assert
          expect(act).to.throw(testCase.expectedError);
        });
      }
    });
    describe('throws with invalid code in both "execute" or "revert"', () => {
      // arrange
      const testCases = [
        {
          testName: 'cannot construct with duplicate lines',
          code: 'duplicate\nduplicate\nunique\nduplicate',
          expectedMessage: 'Duplicates detected in script:\n❌ (0,1,3)\t[0] duplicate\n❌ (0,1,3)\t[1] duplicate\n✅ [2] unique\n❌ (0,1,3)\t[3] duplicate',
        },
        {
          testName: 'cannot construct with empty lines',
          code: 'line1\n\n\nline2',
          expectedMessage: 'Script has empty lines:\n\n (0) line1\n (1) ❌\n (2) ❌\n (3) line2',
        },
      ];
      // act
      const actions = testCases.flatMap((testCase) => ([
        {
          act: () => new ScriptCodeBuilder()
            .withExecute(testCase.code)
            .build(),
          testName: `execute: ${testCase.testName}`,
          expectedMessage: testCase.expectedMessage,
          code: testCase.code,
        },
        {
          act: () => new ScriptCodeBuilder()
            .withRevert(testCase.code)
            .build(),
          testName: `revert: ${testCase.testName}`,
          expectedMessage: `(revert): ${testCase.expectedMessage}`,
          code: testCase.code,
        },
      ]));
      // assert
      for (const action of actions) {
        it(action.testName, () => {
          expect(action.act).to.throw(action.expectedMessage, `Code used: ${action.code}`);
        });
      }
    });
    describe('sets as expected with valid "execute" or "revert"', () => {
      // arrange
      const syntax = new LanguageSyntaxStub()
        .withCommonCodeParts(')', 'else', '(')
        .withCommentDelimiters('#', '//');
      const testCases = [
        {
          testName: 'code is a valid string',
          code: 'valid code',
        },
        {
          testName: 'code consists of common code parts',
          code: syntax.commonCodeParts.join(' '),
        },
        {
          testName: 'code is a common code part',
          code: syntax.commonCodeParts[0],
        },
        {
          testName: `code with duplicated comment lines (${syntax.commentDelimiters[0]})`,
          code: `${syntax.commentDelimiters[0]} comment\n${syntax.commentDelimiters[0]} comment`,
        },
        {
          testName: `code with duplicated comment lines (${syntax.commentDelimiters[1]})`,
          code: `${syntax.commentDelimiters[1]} comment\n${syntax.commentDelimiters[1]} comment`,
        },
      ];
      // act
      const actions = testCases.flatMap((testCase) => ([
        {
          testName: `execute: ${testCase.testName}`,
          act: () => new ScriptCodeBuilder()
            .withSyntax(syntax)
            .withExecute(testCase.code)
            .build(),
          expect: (sut: IScriptCode) => sut.execute === testCase.code,
        },
        {
          testName: `revert: ${testCase.testName}`,
          act: () => new ScriptCodeBuilder()
            .withSyntax(syntax)
            .withRevert(testCase.code)
            .build(),
          expect: (sut: IScriptCode) => sut.revert === testCase.code,
        },
      ]));
      // assert
      for (const action of actions) {
        it(action.testName, () => {
          const sut = action.act();
          expect(action.expect(sut));
        });
      }
    });
  });
  describe('syntax', () => {
    describe('throws if missing', () => {
      itEachAbsentObjectValue((absentValue) => {
        // arrange
        const expectedError = 'missing syntax';
        const syntax = absentValue;
        // act
        const act = () => new ScriptCodeBuilder()
          .withSyntax(syntax)
          .build();
        // assert
        expect(act).to.throw(expectedError);
      });
    });
  });
});

class ScriptCodeBuilder {
  public execute = 'default-execute-code';

  public revert = '';

  public syntax: ILanguageSyntax = new LanguageSyntaxStub();

  public withExecute(execute: string) {
    this.execute = execute;
    return this;
  }

  public withRevert(revert: string) {
    this.revert = revert;
    return this;
  }

  public withSyntax(syntax: ILanguageSyntax) {
    this.syntax = syntax;
    return this;
  }

  public build(): ScriptCode {
    return new ScriptCode(
      this.execute,
      this.revert,
      this.syntax,
    );
  }
}
