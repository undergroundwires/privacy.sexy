import { describe, it, expect } from 'vitest';
import { DistinctReversibleScriptCode } from '@/domain/Executables/Script/Code/DistinctReversibleScriptCode';
import { getAbsentStringTestCases } from '@tests/unit/shared/TestCases/AbsentTests';

describe('DistinctReversibleScriptCode', () => {
  describe('code', () => {
    describe('throws with invalid code', () => {
      // arrange
      const testScenarios: ReadonlyArray<{
        readonly description: string;
        readonly code: {
          readonly execute: string;
          readonly revert?: string;
        },
        readonly expectedError: string;
      }> = [
        {
          description: 'throws when "execute" and "revert" are same',
          code: {
            execute: 'same',
            revert: 'same',
          },
          expectedError: '(revert): Code itself and its reverting code cannot be the same',
        },
        ...getAbsentStringTestCases({ excludeNull: true, excludeUndefined: true })
          .map((testCase) => ({
            description: `cannot construct with ${testCase.valueName} "execute"`,
            code: {
              execute: testCase.absentValue,
              revert: 'code',
            },
            expectedError: 'missing code',
          })),
      ];
      for (const testCase of testScenarios) {
        it(testCase.description, () => {
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
      const testScenarios: ReadonlyArray<{
        readonly description: string;
        readonly code: string;
        readonly revertCode: string | undefined;
      }> = [
        {
          description: 'code and revert code is given',
          code: 'valid code',
          revertCode: 'valid revert-code',
        },
        ...getAbsentStringTestCases({ excludeNull: true })
          .map((testCase) => ({
            description: `only code is given but not revert code (given ${testCase.valueName})`,
            code: 'valid code',
            revertCode: testCase.absentValue,
            expectedError: 'missing code',
          })),
      ];
      // assert
      for (const testCase of testScenarios) {
        it(testCase.description, () => {
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

  public revert: string | undefined = '';

  public withExecute(execute: string) {
    this.execute = execute;
    return this;
  }

  public withRevert(revert: string | undefined) {
    this.revert = revert;
    return this;
  }

  public build(): DistinctReversibleScriptCode {
    return new DistinctReversibleScriptCode(
      this.execute,
      this.revert,
    );
  }
}
