import { describe, it, expect } from 'vitest';
import { ScriptLanguage } from '@/domain/ScriptMetadata/ScriptLanguage';
import type { EnumParser } from '@/application/Common/Enum';
import type { CodeSubstituter } from '@/application/Parser/ScriptMetadata/CodeSubstituter';
import { ProjectDetailsStub } from '@tests/unit/shared/Stubs/ProjectDetailsStub';
import { EnumParserStub } from '@tests/unit/shared/Stubs/EnumParserStub';
import { ScriptMetadataDataStub } from '@tests/unit/shared/Stubs/ScriptMetadataDataStub';
import { CodeSubstituterStub } from '@tests/unit/shared/Stubs/CodeSubstituterStub';
import { parseScriptMetadata } from '@/application/Parser/ScriptMetadata/ScriptMetadataParser';
import type { ObjectAssertion, TypeValidator } from '@/application/Parser/Common/TypeValidator';
import { TypeValidatorStub } from '@tests/unit/shared/Stubs/TypeValidatorStub';
import type { ScriptMetadataData } from '@/application/collections/';
import type { ProjectDetails } from '@/domain/Project/ProjectDetails';
import { createScriptMetadataFactorySpy } from '@tests/unit/shared/Stubs/ScriptMetadataFactoryStub';
import type { ScriptMetadataInitParameters } from '@/domain/ScriptMetadata/ScriptMetadataFactory';

describe('ScriptMetadataParser', () => {
  describe('parseScriptMetadata', () => {
    it('validates data', () => {
      // arrange
      const data = new ScriptMetadataDataStub();
      const expectedAssertion: ObjectAssertion<ScriptMetadataData> = {
        value: data,
        valueName: 'script metadata',
        allowedProperties: ['language', 'startCode', 'endCode'],
      };
      const validatorStub = new TypeValidatorStub();
      const context = new TestContext()
        .withTypeValidator(validatorStub)
        .withData(data);
      // act
      context.parse();
      // assert
      validatorStub.assertObject(expectedAssertion);
    });
    describe('language', () => {
      it('parses as expected', () => {
        // arrange
        const expectedLanguage = ScriptLanguage.batchfile;
        const languageText = 'batchfile';
        const expectedName = 'language';
        const definition = new ScriptMetadataDataStub()
          .withLanguage(languageText);
        const parserMock = new EnumParserStub<ScriptLanguage>()
          .setup(expectedName, languageText, expectedLanguage);
        const context = new TestContext()
          .withParser(parserMock)
          .withData(definition);
        // act
        const parameters = context.parse();
        // assert
        expect(parameters.language).to.equal(expectedLanguage);
      });
    });
    describe('substitutes code as expected', () => {
      // arrange
      const code = 'hello';
      const expected = 'substituted';
      const testScenarios: readonly {
        readonly description: string;
        getActualValue(params: ScriptMetadataInitParameters): string;
        readonly data: ScriptMetadataData;
      }[] = [
        {
          description: 'startCode',
          getActualValue: (params) => params.startCode,
          data: new ScriptMetadataDataStub()
            .withStartCode(code),
        },
        {
          description: 'endCode',
          getActualValue: (params) => params.endCode,
          data: new ScriptMetadataDataStub()
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
          const definition = context.parse();
          // assert
          const actual = getActualValue(definition);
          expect(actual).to.equal(expected);
        });
      });
    });
  });
});

class TestContext {
  private languageParser: EnumParser<ScriptLanguage> = new EnumParserStub<ScriptLanguage>()
    .setupDefaultValue(ScriptLanguage.shellscript);

  private codeSubstituter: CodeSubstituter = new CodeSubstituterStub().substitute;

  private validator: TypeValidator = new TypeValidatorStub();

  private data: ScriptMetadataData = new ScriptMetadataDataStub();

  private projectDetails: ProjectDetails = new ProjectDetailsStub();

  public withData(data: ScriptMetadataData): this {
    this.data = data;
    return this;
  }

  public withProjectDetails(projectDetails: ProjectDetails): this {
    this.projectDetails = projectDetails;
    return this;
  }

  public withParser(parser: EnumParser<ScriptLanguage>): this {
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

  public parse(): ScriptMetadataInitParameters {
    const spy = createScriptMetadataFactorySpy();
    const scriptMetadata = parseScriptMetadata(
      this.data,
      this.projectDetails,
      {
        languageParser: this.languageParser,
        codeSubstituter: this.codeSubstituter,
        validator: this.validator,
        createScriptMetadata: spy.factory,
      },
    );
    const parameters = spy.getInitParameters(scriptMetadata);
    if (!parameters) {
      throw new Error('Factory did not create any instance');
    }
    return parameters;
  }
}
