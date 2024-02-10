import { describe, it, expect } from 'vitest';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { ScriptingDefinitionParser } from '@/application/Parser/ScriptingDefinition/ScriptingDefinitionParser';
import { IEnumParser } from '@/application/Common/Enum';
import { ICodeSubstituter } from '@/application/Parser/ScriptingDefinition/ICodeSubstituter';
import { IScriptingDefinition } from '@/domain/IScriptingDefinition';
import { ProjectDetailsStub } from '@tests/unit/shared/Stubs/ProjectDetailsStub';
import { EnumParserStub } from '@tests/unit/shared/Stubs/EnumParserStub';
import { ScriptingDefinitionDataStub } from '@tests/unit/shared/Stubs/ScriptingDefinitionDataStub';
import { CodeSubstituterStub } from '@tests/unit/shared/Stubs/CodeSubstituterStub';

describe('ScriptingDefinitionParser', () => {
  describe('parseScriptingDefinition', () => {
    describe('language', () => {
      it('parses as expected', () => {
        // arrange
        const expectedLanguage = ScriptingLanguage.batchfile;
        const languageText = 'batchfile';
        const expectedName = 'language';
        const projectDetails = new ProjectDetailsStub();
        const definition = new ScriptingDefinitionDataStub()
          .withLanguage(languageText);
        const parserMock = new EnumParserStub<ScriptingLanguage>()
          .setup(expectedName, languageText, expectedLanguage);
        const sut = new ScriptingDefinitionParserBuilder()
          .withParser(parserMock)
          .build();
        // act
        const actual = sut.parse(definition, projectDetails);
        // assert
        expect(actual.language).to.equal(expectedLanguage);
      });
    });
    describe('substitutes code as expected', () => {
      // arrange
      const code = 'hello';
      const expected = 'substituted';
      const testCases = [
        {
          name: 'startCode',
          getActualValue: (result: IScriptingDefinition) => result.startCode,
          data: new ScriptingDefinitionDataStub()
            .withStartCode(code),
        },
        {
          name: 'endCode',
          getActualValue: (result: IScriptingDefinition) => result.endCode,
          data: new ScriptingDefinitionDataStub()
            .withEndCode(code),
        },
      ];
      for (const testCase of testCases) {
        it(testCase.name, () => {
          const projectDetails = new ProjectDetailsStub();
          const substituterMock = new CodeSubstituterStub()
            .setup(code, projectDetails, expected);
          const sut = new ScriptingDefinitionParserBuilder()
            .withSubstituter(substituterMock)
            .build();
          // act
          const definition = sut.parse(testCase.data, projectDetails);
          // assert
          const actual = testCase.getActualValue(definition);
          expect(actual).to.equal(expected);
        });
      }
    });
  });
});

class ScriptingDefinitionParserBuilder {
  private languageParser: IEnumParser<ScriptingLanguage> = new EnumParserStub<ScriptingLanguage>()
    .setupDefaultValue(ScriptingLanguage.shellscript);

  private codeSubstituter: ICodeSubstituter = new CodeSubstituterStub();

  public withParser(parser: IEnumParser<ScriptingLanguage>) {
    this.languageParser = parser;
    return this;
  }

  public withSubstituter(substituter: ICodeSubstituter) {
    this.codeSubstituter = substituter;
    return this;
  }

  public build() {
    return new ScriptingDefinitionParser(this.languageParser, this.codeSubstituter);
  }
}
