import { describe, it, expect } from 'vitest';
import { createScriptingDefinition, type ScriptingDefinitionFactory } from '@/domain/ScriptingDefinitionFactory';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { getEnumValues } from '@/application/Common/Enum';
import { itEachAbsentStringValue } from '@tests/unit/shared/TestCases/AbsentTests';

describe('ScriptingDefinitionFactory', () => {
  describe('createScriptingDefinition', () => {
    describe('language', () => {
      describe('sets correctly', () => {
        // arrange
        const expectedValues = getEnumValues(ScriptingLanguage);
        expectedValues.forEach((expected) => {
          it(ScriptingLanguage[expected], () => {
            // act
            const sut = new TestContext()
              .withLanguage(expected)
              .construct();
            // assert
            expect(sut.language).to.equal(expected);
          });
        });
      });
      it('throws if unknown', () => {
        // arrange
        const unknownValue: ScriptingLanguage = 666 as never;
        const errorMessage = `unsupported language: ${unknownValue}`;
        // act
        const act = () => new TestContext()
          .withLanguage(unknownValue)
          .construct();
        // assert
        expect(act).to.throw(errorMessage);
      });
    });
    describe('fileExtension', () => {
      describe('returns expected for each language', () => {
        // arrange
        const testCases = new Map<ScriptingLanguage, string>([
          [ScriptingLanguage.batchfile, 'bat'],
          [ScriptingLanguage.shellscript, 'sh'],
        ]);
        for (const test of testCases.entries()) {
          const language = test[0];
          const expectedExtension = test[1];
          it(`${ScriptingLanguage[language]} has ${expectedExtension}`, () => {
            // act
            const sut = new TestContext()
              .withLanguage(language)
              .construct();
            // assert
            expect(sut.fileExtension, expectedExtension);
          });
        }
      });
    });
    describe('startCode', () => {
      it('sets correctly', () => {
        // arrange
        const expected = 'REM start-code';
        // act
        const sut = new TestContext()
          .withStartCode(expected)
          .construct();
        // assert
        expect(sut.startCode).to.equal(expected);
      });
      describe('throws when absent', () => {
        itEachAbsentStringValue((absentValue) => {
          // arrange
          const expectedError = 'missing start code';
          // act
          const act = () => new TestContext()
            .withStartCode(absentValue)
            .construct();
          // assert
          expect(act).to.throw(expectedError);
        }, { excludeNull: true, excludeUndefined: true });
      });
    });
    describe('endCode', () => {
      it('sets correctly', () => {
        // arrange
        const expected = 'REM end-code';
        // act
        const sut = new TestContext()
          .withEndCode(expected)
          .construct();
        // assert
        expect(sut.endCode).to.equal(expected);
      });
      describe('throws when absent', () => {
        itEachAbsentStringValue((absentValue) => {
          // arrange
          const expectedError = 'missing end code';
          // act
          const act = () => new TestContext()
            .withEndCode(absentValue)
            .construct();
          // assert
          expect(act).to.throw(expectedError);
        }, { excludeNull: true, excludeUndefined: true });
      });
    });
  });
});

class TestContext {
  private language = ScriptingLanguage.shellscript;

  private startCode = `# [${TestContext.name}]: start-code`;

  private endCode = `# [${TestContext.name}]: end-code`;

  public withLanguage(language: ScriptingLanguage): this {
    this.language = language;
    return this;
  }

  public withStartCode(startCode: string): this {
    this.startCode = startCode;
    return this;
  }

  public withEndCode(endCode: string): this {
    this.endCode = endCode;
    return this;
  }

  public construct(): ReturnType<ScriptingDefinitionFactory> {
    return createScriptingDefinition({
      language: this.language,
      startCode: this.startCode,
      endCode: this.endCode,
    });
  }
}
