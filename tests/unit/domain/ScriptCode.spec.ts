import { describe, it, expect } from 'vitest';
import { ScriptCode } from '@/domain/ScriptCode';
import { getAbsentStringTestCases } from '@tests/unit/shared/TestCases/AbsentTests';

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
        ...getAbsentStringTestCases().map((testCase) => ({
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
    describe('sets as expected with valid "execute" or "revert"', () => {
      // arrange
      const testCases = [
        {
          testName: 'code and revert code is given',
          code: 'valid code',
          revertCode: 'valid revert-code',
        },
        {
          testName: 'only code is given but not revert code',
          code: 'valid code',
          revertCode: undefined,
        },
      ];
      // assert
      for (const testCase of testCases) {
        it(testCase.testName, () => {
          // act
          const sut = new ScriptCodeBuilder()
            .withExecute(testCase.code)
            .withRevert(testCase.revertCode)
            .build();
          // assert
          expect(sut.execute).to.equal(testCase.code);
          expect(sut.revert).to.equal(testCase.revertCode);
        });
      }
    });
  });
});

class ScriptCodeBuilder {
  public execute = 'default-execute-code';

  public revert = '';

  public withExecute(execute: string) {
    this.execute = execute;
    return this;
  }

  public withRevert(revert: string) {
    this.revert = revert;
    return this;
  }

  public build(): ScriptCode {
    return new ScriptCode(
      this.execute,
      this.revert,
    );
  }
}
