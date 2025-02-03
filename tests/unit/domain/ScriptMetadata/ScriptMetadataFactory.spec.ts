import { describe, it, expect } from 'vitest';
import { ScriptLanguage } from '@/domain/ScriptMetadata/ScriptLanguage';
import { getEnumValues } from '@/application/Common/Enum';
import { itEachAbsentStringValue } from '@tests/unit/shared/TestCases/AbsentTests';
import type { ScriptMetadata } from '@/domain/ScriptMetadata/ScriptMetadata';
import { createScriptMetadata } from '@/domain/ScriptMetadata/ScriptMetadataFactory';

describe('ScriptMetadataFactory', () => {
  describe('language', () => {
    describe('sets as expected', () => {
      // arrange
      const expectedValues = getEnumValues(ScriptLanguage);
      expectedValues.forEach((expected) => {
        it(ScriptLanguage[expected], () => {
          // act
          const sut = new ScriptingDefinitionBuilder()
            .withLanguage(expected)
            .create();
          // assert
          expect(sut.language).to.equal(expected);
        });
      });
    });
    it('throws if unknown', () => {
      // arrange
      const unknownValue: ScriptLanguage = 666 as never;
      const errorMessage = `unsupported language: ${unknownValue}`;
      // act
      const act = () => new ScriptingDefinitionBuilder()
        .withLanguage(unknownValue)
        .create();
      // assert
      expect(act).to.throw(errorMessage);
    });
  });
  describe('fileExtension', () => {
    describe('returns expected for each language', () => {
      // arrange
      const testCases = new Map<ScriptLanguage, string>([
        [ScriptLanguage.batchfile, 'bat'],
        [ScriptLanguage.shellscript, 'sh'],
      ]);
      for (const test of testCases.entries()) {
        const language = test[0];
        const expectedExtension = test[1];
        it(`${ScriptLanguage[language]} has ${expectedExtension}`, () => {
          // act
          const sut = new ScriptingDefinitionBuilder()
            .withLanguage(language)
            .create();
          // assert
          expect(sut.fileExtension, expectedExtension);
        });
      }
    });
  });
  describe('startCode', () => {
    it('sets as expected', () => {
      // arrange
      const expected = 'REM start-code';
      // act
      const sut = new ScriptingDefinitionBuilder()
        .withStartCode(expected)
        .create();
      // assert
      expect(sut.startCode).to.equal(expected);
    });
    describe('throws when absent', () => {
      itEachAbsentStringValue((absentValue) => {
        // arrange
        const expectedError = 'missing start code';
        // act
        const act = () => new ScriptingDefinitionBuilder()
          .withStartCode(absentValue)
          .create();
        // assert
        expect(act).to.throw(expectedError);
      }, { excludeNull: true, excludeUndefined: true });
    });
  });
  describe('endCode', () => {
    it('sets as expected', () => {
      // arrange
      const expected = 'REM end-code';
      // act
      const sut = new ScriptingDefinitionBuilder()
        .withEndCode(expected)
        .create();
      // assert
      expect(sut.endCode).to.equal(expected);
    });
    describe('throws when absent', () => {
      itEachAbsentStringValue((absentValue) => {
        // arrange
        const expectedError = 'missing end code';
        // act
        const act = () => new ScriptingDefinitionBuilder()
          .withEndCode(absentValue)
          .create();
        // assert
        expect(act).to.throw(expectedError);
      }, { excludeNull: true, excludeUndefined: true });
    });
  });
});

class ScriptingDefinitionBuilder {
  private language = ScriptLanguage.shellscript;

  private startCode = `# [${ScriptingDefinitionBuilder.name}]: start-code`;

  private endCode = `# [${ScriptingDefinitionBuilder.name}]: end-code`;

  public withLanguage(language: ScriptLanguage): this {
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

  public create(): ScriptMetadata {
    return createScriptMetadata({
      language: this.language,
      startCode: this.startCode,
      endCode: this.endCode,
    });
  }
}
