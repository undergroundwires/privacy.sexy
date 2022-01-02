import 'mocha';
import { expect } from 'chai';
import { ScriptingDefinition } from '@/domain/ScriptingDefinition';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { getEnumValues } from '@/application/Common/Enum';

describe('ScriptingDefinition', () => {
  describe('language', () => {
    describe('sets as expected', () => {
      // arrange
      const expectedValues = getEnumValues(ScriptingLanguage);
      expectedValues.forEach((expected) => {
        it(ScriptingLanguage[expected], () => {
          // act
          const sut = new ScriptingDefinitionBuilder()
            .withLanguage(expected)
            .build();
          // assert
          expect(sut.language).to.equal(expected);
        });
      });
    });
    it('throws if unknown', () => {
      // arrange
      const unknownValue: ScriptingLanguage = 666;
      const errorMessage = `unsupported language: ${unknownValue}`;
      // act
      const act = () => new ScriptingDefinitionBuilder()
        .withLanguage(unknownValue)
        .build();
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
      Array.from(testCases.entries()).forEach((test) => {
        const language = test[0];
        const expectedExtension = test[1];
        it(`${ScriptingLanguage[language]} has ${expectedExtension}`, () => {
          // act
          const sut = new ScriptingDefinitionBuilder()
            .withLanguage(language)
            .build();
          // assert
          expect(sut.fileExtension, expectedExtension);
        });
      });
    });
  });
  describe('startCode', () => {
    it('sets as expected', () => {
      // arrange
      const expected = 'REM start-code';
      // act
      const sut = new ScriptingDefinitionBuilder()
        .withStartCode(expected)
        .build();
      // assert
      expect(sut.startCode).to.equal(expected);
    });
    it('throws when undefined', () => {
      // arrange
      const expectedError = 'undefined start code';
      const undefinedValues = ['', undefined];
      for (const undefinedValue of undefinedValues) {
        // act
        const act = () => new ScriptingDefinitionBuilder()
          .withStartCode(undefinedValue)
          .build();
        // assert
        expect(act).to.throw(expectedError);
      }
    });
  });
  describe('endCode', () => {
    it('sets as expected', () => {
      // arrange
      const expected = 'REM end-code';
      // act
      const sut = new ScriptingDefinitionBuilder()
        .withEndCode(expected)
        .build();
      // assert
      expect(sut.endCode).to.equal(expected);
    });
    it('throws when undefined', () => {
      // arrange
      const expectedError = 'undefined end code';
      const undefinedValues = ['', undefined];
      for (const undefinedValue of undefinedValues) {
        // act
        const act = () => new ScriptingDefinitionBuilder()
          .withEndCode(undefinedValue)
          .build();
        // assert
        expect(act).to.throw(expectedError);
      }
    });
  });
});

class ScriptingDefinitionBuilder {
  private language = ScriptingLanguage.shellscript;

  private startCode = 'REM start-code';

  private endCode = 'REM end-code';

  public withLanguage(language: ScriptingLanguage): ScriptingDefinitionBuilder {
    this.language = language;
    return this;
  }

  public withStartCode(startCode: string): ScriptingDefinitionBuilder {
    this.startCode = startCode;
    return this;
  }

  public withEndCode(endCode: string): ScriptingDefinitionBuilder {
    this.endCode = endCode;
    return this;
  }

  public build(): ScriptingDefinition {
    return new ScriptingDefinition(this.language, this.startCode, this.endCode);
  }
}
