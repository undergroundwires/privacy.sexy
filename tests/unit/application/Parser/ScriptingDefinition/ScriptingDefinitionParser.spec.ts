import { describe, it, expect } from 'vitest';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import type { EnumParser } from '@/application/Common/Enum';
import type { CodeSubstituter } from '@/application/Parser/ScriptingDefinition/CodeSubstituter';
import type { IScriptingDefinition } from '@/domain/IScriptingDefinition';
import { ProjectDetailsStub } from '@tests/unit/shared/Stubs/ProjectDetailsStub';
import { EnumParserStub } from '@tests/unit/shared/Stubs/EnumParserStub';
import { ScriptingDefinitionDataStub } from '@tests/unit/shared/Stubs/ScriptingDefinitionDataStub';
import { CodeSubstituterStub } from '@tests/unit/shared/Stubs/CodeSubstituterStub';
import { parseScriptingDefinition } from '@/application/Parser/ScriptingDefinition/ScriptingDefinitionParser';
import type { ObjectAssertion, TypeValidator } from '@/application/Parser/Common/TypeValidator';
import { TypeValidatorStub } from '@tests/unit/shared/Stubs/TypeValidatorStub';
import type { ScriptingDefinitionData } from '@/application/collections/';
import type { ProjectDetails } from '@/domain/Project/ProjectDetails';

describe('ScriptingDefinitionParser', () => {
  describe('parseScriptingDefinition', () => {
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
    describe('language', () => {
      it('parses as expected', () => {
        // arrange
        const expectedLanguage = ScriptingLanguage.batchfile;
        const languageText = 'batchfile';
        const expectedName = 'language';
        const definition = new ScriptingDefinitionDataStub()
          .withLanguage(languageText);
        const parserMock = new EnumParserStub<ScriptingLanguage>()
          .setup(expectedName, languageText, expectedLanguage);
        const context = new TestContext()
          .withParser(parserMock)
          .withData(definition);
        // act
        const actual = context.parseScriptingDefinition();
        // assert
        expect(actual.language).to.equal(expectedLanguage);
      });
    });
    describe('substitutes code as expected', () => {
      // arrange
      const code = 'hello';
      const expected = 'substituted';
      const testScenarios: readonly {
        readonly description: string;
        getActualValue(result: IScriptingDefinition): string;
        readonly data: ScriptingDefinitionData;
      }[] = [
        {
          description: 'startCode',
          getActualValue: (result: IScriptingDefinition) => result.startCode,
          data: new ScriptingDefinitionDataStub()
            .withStartCode(code),
        },
        {
          description: 'endCode',
          getActualValue: (result: IScriptingDefinition) => result.endCode,
          data: new ScriptingDefinitionDataStub()
            .withEndCode(code),
        },
      ];
      testScenarios.forEach(({
        description, data, getActualValue,
      }) => {
        it(description, () => {
          const projectDetails = new ProjectDetailsStub();
          const substituterMock = new CodeSubstituterStub()
            .setup(code, projectDetails, expected);
          const context = new TestContext()
            .withData(data)
            .withProjectDetails(projectDetails)
            .withSubstituter(substituterMock.substitute);
          // act
          const definition = context.parseScriptingDefinition();
          // assert
          const actual = getActualValue(definition);
          expect(actual).to.equal(expected);
        });
      });
    });
  });
});

class TestContext {
  private languageParser: EnumParser<ScriptingLanguage> = new EnumParserStub<ScriptingLanguage>()
    .setupDefaultValue(ScriptingLanguage.shellscript);

  private codeSubstituter: CodeSubstituter = new CodeSubstituterStub().substitute;

  private validator: TypeValidator = new TypeValidatorStub();

  private data: ScriptingDefinitionData = new ScriptingDefinitionDataStub();

  private projectDetails: ProjectDetails = new ProjectDetailsStub();

  public withData(data: ScriptingDefinitionData): this {
    this.data = data;
    return this;
  }

  public withProjectDetails(projectDetails: ProjectDetails): this {
    this.projectDetails = projectDetails;
    return this;
  }

  public withParser(parser: EnumParser<ScriptingLanguage>): this {
    this.languageParser = parser;
    return this;
  }

  public withSubstituter(substituter: CodeSubstituter): this {
    this.codeSubstituter = substituter;
    return this;
  }

  public withTypeValidator(validator: TypeValidator): this {
    this.validator = validator;
    return this;
  }

  public parseScriptingDefinition() {
    return parseScriptingDefinition(
      this.data,
      this.projectDetails,
      {
        languageParser: this.languageParser,
        codeSubstituter: this.codeSubstituter,
        validator: this.validator,
      },
    );
  }
}
