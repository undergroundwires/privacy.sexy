import { describe, it, expect } from 'vitest';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
<<<<<<< HEAD
import type { EnumParser } from '@/application/Common/Enum';
import type { CodeSubstituter } from '@/application/Parser/ScriptingDefinition/CodeSubstituter';
=======
import { ScriptingDefinitionParser } from '@/application/Parser/ScriptingDefinition/ScriptingDefinitionParser';
import type { IEnumParser } from '@/application/Common/Enum';
import type { ICodeSubstituter } from '@/application/Parser/ScriptingDefinition/ICodeSubstituter';
>>>>>>> cbea6fa3 (Add unique script/category IDs $49, $59, $262, $126)
import type { IScriptingDefinition } from '@/domain/IScriptingDefinition';
import { ProjectDetailsStub } from '@tests/unit/shared/Stubs/ProjectDetailsStub';
import { EnumParserStub } from '@tests/unit/shared/Stubs/EnumParserStub';
import { ScriptingDefinitionDataStub } from '@tests/unit/shared/Stubs/ScriptingDefinitionDataStub';
import { CodeSubstituterStub } from '@tests/unit/shared/Stubs/CodeSubstituterStub';

describe('ScriptingDefinitionParser', () => {
  describe('parseScriptingDefinition', () => {
<<<<<<< HEAD
    it('validates data', () => {
      // arrange
      const data = new ScriptingDefinitionDataStub();
      const expectedAssertion: ObjectAssertion<ScriptingDefinitionData> = {
        value: data,
        valueName: 'scripting definition',
        allowedProperties: ['language', 'startCode', 'endCode'],
      };
      const validatorStub = new TypeValidatorStub();
      const context = new TestContext()
        .withTypeValidator(validatorStub)
        .withData(data);
      // act
      context.parseScriptingDefinition();
      // assert
      validatorStub.assertObject(expectedAssertion);
    });
=======
>>>>>>> cbea6fa3 (Add unique script/category IDs $49, $59, $262, $126)
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
<<<<<<< HEAD
          const context = new TestContext()
            .withData(data)
            .withProjectDetails(projectDetails)
            .withSubstituter(substituterMock.substitute);
=======
          const sut = new ScriptingDefinitionParserBuilder()
            .withSubstituter(substituterMock)
            .build();
>>>>>>> cbea6fa3 (Add unique script/category IDs $49, $59, $262, $126)
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

  private codeSubstituter: CodeSubstituter = new CodeSubstituterStub().substitute;

  public withParser(parser: IEnumParser<ScriptingLanguage>) {
    this.languageParser = parser;
    return this;
  }

<<<<<<< HEAD
  public withSubstituter(substituter: CodeSubstituter): this {
=======
  public withSubstituter(substituter: ICodeSubstituter) {
>>>>>>> cbea6fa3 (Add unique script/category IDs $49, $59, $262, $126)
    this.codeSubstituter = substituter;
    return this;
  }

  public build() {
    return new ScriptingDefinitionParser(this.languageParser, this.codeSubstituter);
  }
}
