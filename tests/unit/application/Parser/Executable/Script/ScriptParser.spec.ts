import { describe, it, expect } from 'vitest';
import type { ScriptData, CallScriptData, CodeScriptData } from '@/application/collections/';
import { parseScript } from '@/application/Parser/Executable/Script/ScriptParser';
import { type DocsParser } from '@/application/Parser/Executable/DocumentationParser';
import { RecommendationLevel } from '@/domain/Executables/Script/RecommendationLevel';
import { itEachAbsentStringValue } from '@tests/unit/shared/TestCases/AbsentTests';
import { ScriptCompilerStub } from '@tests/unit/shared/Stubs/ScriptCompilerStub';
import { createScriptDataWithCall, createScriptDataWithCode, createScriptDataWithoutCallOrCodes } from '@tests/unit/shared/Stubs/ScriptDataStub';
import { EnumParserStub } from '@tests/unit/shared/Stubs/EnumParserStub';
import { ScriptCodeStub } from '@tests/unit/shared/Stubs/ScriptCodeStub';
import { LanguageSyntaxStub } from '@tests/unit/shared/Stubs/LanguageSyntaxStub';
import type { EnumParser } from '@/application/Common/Enum';
import { NoEmptyLines } from '@/application/Parser/Executable/Script/Validation/Rules/NoEmptyLines';
import { NoDuplicatedLines } from '@/application/Parser/Executable/Script/Validation/Rules/NoDuplicatedLines';
import { CodeValidatorStub } from '@tests/unit/shared/Stubs/CodeValidatorStub';
import type { ICodeValidator } from '@/application/Parser/Executable/Script/Validation/ICodeValidator';
import type { ErrorWithContextWrapper } from '@/application/Parser/Common/ContextualError';
import { ErrorWrapperStub } from '@tests/unit/shared/Stubs/ErrorWrapperStub';
import type { ExecutableValidatorFactory } from '@/application/Parser/Executable/Validation/ExecutableValidator';
import { ExecutableValidatorStub, createExecutableValidatorFactoryStub } from '@tests/unit/shared/Stubs/ExecutableValidatorStub';
import { ExecutableType } from '@/application/Parser/Executable/Validation/ExecutableType';
import type { ScriptErrorContext } from '@/application/Parser/Executable/Validation/ExecutableErrorContext';
import type { ScriptCodeFactory } from '@/domain/Executables/Script/Code/ScriptCodeFactory';
import { createScriptCodeFactoryStub } from '@tests/unit/shared/Stubs/ScriptCodeFactoryStub';
import { ScriptStub } from '@tests/unit/shared/Stubs/ScriptStub';
import { createScriptFactorySpy } from '@tests/unit/shared/Stubs/ScriptFactoryStub';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import { itThrowsContextualError } from '@tests/unit/application/Parser/Common/ContextualErrorTester';
import { CategoryCollectionSpecificUtilitiesStub } from '@tests/unit/shared/Stubs/CategoryCollectionSpecificUtilitiesStub';
import type { CategoryCollectionSpecificUtilities } from '@/application/Parser/Executable/CategoryCollectionSpecificUtilities';
import type { ObjectAssertion } from '@/application/Parser/Common/TypeValidator';
import type { ExecutableId } from '@/domain/Executables/Identifiable';
import type { ScriptFactory } from '@/domain/Executables/Script/ScriptFactory';
import { itAsserts, itValidatesType, itValidatesName } from '../Validation/ExecutableValidationTester';
import { generateDataValidationTestScenarios } from '../Validation/DataValidationTestScenarioGenerator';

describe('ScriptParser', () => {
  describe('parseScript', () => {
    describe('property validation', () => {
      describe('validates object', () => {
        // arrange
        const expectedScript = createScriptDataWithCall();
        const expectedContext: ScriptErrorContext = {
          type: ExecutableType.Script,
          self: expectedScript,
        };
        const expectedAssertion: ObjectAssertion<CallScriptData & CodeScriptData> = {
          value: expectedScript,
          valueName: expectedScript.name,
          allowedProperties: [
            'name', 'recommend', 'code', 'revertCode', 'call', 'docs',
          ],
        };
        itValidatesType(
          (validatorFactory) => {
            // act
            new TestContext()
              .withData(expectedScript)
              .withValidatorFactory(validatorFactory)
              .parseScript();
            // assert
            return {
              expectedDataToValidate: expectedScript,
              expectedErrorContext: expectedContext,
              assertValidation: (validator) => validator.assertObject(expectedAssertion),
            };
          },
        );
      });
      describe('validates union type', () => {
        // arrange
        const testScenarios = generateDataValidationTestScenarios<ScriptData>(
          {
            assertErrorMessage: 'Neither "call" or "code" is defined.',
            expectFail: [{
              description: 'with no call or code',
              data: createScriptDataWithoutCallOrCodes(),
            }],
            expectPass: [
              {
                description: 'with call',
                data: createScriptDataWithCall(),
              },
              {
                description: 'with code',
                data: createScriptDataWithCode(),
              },
            ],
          },
          {
            assertErrorMessage: 'Both "call" and "revertCode" are defined.',
            expectFail: [{
              description: 'with both call and revertCode',
              data: createScriptDataWithCall()
                .withRevertCode('revert-code'),
            }],
            expectPass: [
              {
                description: 'with call, without revertCode',
                data: createScriptDataWithCall()
                  .withRevertCode(undefined),
              },
              {
                description: 'with revertCode, without call',
                data: createScriptDataWithCode()
                  .withRevertCode('revert code'),
              },
            ],
          },
          {
            assertErrorMessage: 'Both "call" and "code" are defined.',
            expectFail: [{
              description: 'with both call and code',
              data: createScriptDataWithCall()
                .withCode('code'),
            }],
            expectPass: [
              {
                description: 'with call, without code',
                data: createScriptDataWithCall()
                  .withCode(''),
              },
              {
                description: 'with code, without call',
                data: createScriptDataWithCode()
                  .withCode('code'),
              },
            ],
          },
        );
        testScenarios.forEach(({
          description, expectedPass, data: scriptData, expectedMessage,
        }) => {
          describe(description, () => {
            itAsserts({
              expectedConditionResult: expectedPass,
              test: (validatorFactory) => {
                const expectedContext: ScriptErrorContext = {
                  type: ExecutableType.Script,
                  self: scriptData,
                };
                // act
                new TestContext()
                  .withData(scriptData)
                  .withValidatorFactory(validatorFactory)
                  .parseScript();
                // assert
                expectExists(expectedMessage);
                return {
                  expectedErrorMessage: expectedMessage,
                  expectedErrorContext: expectedContext,
                };
              },
            });
          });
        });
      });
    });
    describe('id', () => {
      it('creates ID correctly', () => {
        // arrange
        const expectedId: ExecutableId = 'expected-id';
        const scriptData = createScriptDataWithCode()
          .withName(expectedId);
        const { scriptFactorySpy, getInitParameters } = createScriptFactorySpy();
        // act
        const actualScript = new TestContext()
          .withData(scriptData)
          .withScriptFactory(scriptFactorySpy)
          .parseScript();
        // assert
        const actualId = getInitParameters(actualScript)?.executableId;
        expect(actualId).to.equal(expectedId);
      });
    });
    describe('name', () => {
      it('parses name correctly', () => {
        // arrange
        const expected = 'test-expected-name';
        const scriptData = createScriptDataWithCode()
          .withName(expected);
        const { scriptFactorySpy, getInitParameters } = createScriptFactorySpy();
        // act
        const actualScript = new TestContext()
          .withData(scriptData)
          .withScriptFactory(scriptFactorySpy)
          .parseScript();
        // assert
        const actualName = getInitParameters(actualScript)?.name;
        expect(actualName).to.equal(expected);
      });
      describe('validates name', () => {
        // arrange
        const expectedName = 'expected script name to be validated';
        const script = createScriptDataWithCall()
          .withName(expectedName);
        const expectedContext: ScriptErrorContext = {
          type: ExecutableType.Script,
          self: script,
        };
        itValidatesName((validatorFactory) => {
          // act
          new TestContext()
            .withData(script)
            .withValidatorFactory(validatorFactory)
            .parseScript();
          // assert
          return {
            expectedNameToValidate: expectedName,
            expectedErrorContext: expectedContext,
          };
        });
      });
    });
    describe('docs', () => {
      it('parses docs correctly', () => {
        // arrange
        const expectedDocs = ['https://expected-doc1.com', 'https://expected-doc2.com'];
        const { scriptFactorySpy, getInitParameters } = createScriptFactorySpy();
        const scriptData = createScriptDataWithCode()
          .withDocs(expectedDocs);
        const docsParser: DocsParser = (data) => data.docs as typeof expectedDocs;
        // act
        const actualScript = new TestContext()
          .withData(scriptData)
          .withScriptFactory(scriptFactorySpy)
          .withDocsParser(docsParser)
          .parseScript();
        // assert
        const actualDocs = getInitParameters(actualScript)?.docs;
        expect(actualDocs).to.deep.equal(expectedDocs);
      });
    });
    describe('level', () => {
      describe('generated `undefined` level if given absent value', () => {
        itEachAbsentStringValue((absentValue) => {
          // arrange
          const expectedLevel = undefined;
          const scriptData = createScriptDataWithCode()
            .withRecommend(absentValue);
          const { scriptFactorySpy, getInitParameters } = createScriptFactorySpy();
          // act
          const actualScript = new TestContext()
            .withData(scriptData)
            .withScriptFactory(scriptFactorySpy)
            .parseScript();
          // assert
          const actualLevel = getInitParameters(actualScript)?.level;
          expect(actualLevel).to.equal(expectedLevel);
        }, { excludeNull: true });
      });
      it('parses level as expected', () => {
        // arrange
        const expectedLevel = RecommendationLevel.Standard;
        const expectedName = 'level';
        const levelText = 'standard';
        const scriptData = createScriptDataWithCode()
          .withRecommend(levelText);
        const parserMock = new EnumParserStub<RecommendationLevel>()
          .setup(expectedName, levelText, expectedLevel);
        const { scriptFactorySpy, getInitParameters } = createScriptFactorySpy();
        // act
        const actualScript = new TestContext()
          .withData(scriptData)
          .withParser(parserMock)
          .withScriptFactory(scriptFactorySpy)
          .parseScript();
        // assert
        const actualLevel = getInitParameters(actualScript)?.level;
        expect(actualLevel).to.equal(expectedLevel);
      });
    });
    describe('code', () => {
      it('creates from script code factory', () => {
        // arrange
        const expectedCode = new ScriptCodeStub();
        const scriptCodeFactory: ScriptCodeFactory = () => expectedCode;
        const { scriptFactorySpy, getInitParameters } = createScriptFactorySpy();
        // act
        const actualScript = new TestContext()
          .withScriptCodeFactory(scriptCodeFactory)
          .withScriptFactory(scriptFactorySpy)
          .parseScript();
        // assert
        const actualCode = getInitParameters(actualScript)?.code;
        expect(expectedCode).to.equal(actualCode);
      });
      describe('parses code correctly', () => {
        it('parses "execute" as expected', () => {
          // arrange
          const expectedCode = 'expected-code';
          let actualCode: string | undefined;
          const scriptCodeFactory: ScriptCodeFactory = (code) => {
            actualCode = code;
            return new ScriptCodeStub();
          };
          const scriptData = createScriptDataWithCode()
            .withCode(expectedCode);
          // act
          new TestContext()
            .withData(scriptData)
            .withScriptCodeFactory(scriptCodeFactory)
            .parseScript();
          // assert
          expect(actualCode).to.equal(expectedCode);
        });
        it('parses "revert" as expected', () => {
          // arrange
          const expectedRevertCode = 'expected-revert-code';
          const scriptData = createScriptDataWithCode()
            .withRevertCode(expectedRevertCode);
          let actualRevertCode: string | undefined;
          const scriptCodeFactory: ScriptCodeFactory = (_, revertCode) => {
            actualRevertCode = revertCode;
            return new ScriptCodeStub();
          };
          // act
          new TestContext()
            .withData(scriptData)
            .withScriptCodeFactory(scriptCodeFactory)
            .parseScript();
          // assert
          expect(actualRevertCode).to.equal(expectedRevertCode);
        });
      });
      describe('compiler', () => {
        it('compiles the code through the compiler', () => {
          // arrange
          const expectedCode = new ScriptCodeStub();
          const script = createScriptDataWithCode();
          const compiler = new ScriptCompilerStub()
            .withCompileAbility(script, expectedCode);
          const collectionUtilities = new CategoryCollectionSpecificUtilitiesStub()
            .withCompiler(compiler);
          const { scriptFactorySpy, getInitParameters } = createScriptFactorySpy();
          // act
          const actualScript = new TestContext()
            .withData(script)
            .withCollectionUtilities(collectionUtilities)
            .withScriptFactory(scriptFactorySpy)
            .parseScript();
          // assert
          const actualCode = getInitParameters(actualScript)?.code;
          expect(actualCode).to.equal(expectedCode);
        });
      });
      describe('syntax', () => {
        it('set from the context', () => { // tests through script validation logic
          // arrange
          const commentDelimiter = 'should not throw';
          const duplicatedCode = `${commentDelimiter} duplicate-line\n${commentDelimiter} duplicate-line`;
          const collectionUtilities = new CategoryCollectionSpecificUtilitiesStub()
            .withSyntax(new LanguageSyntaxStub().withCommentDelimiters(commentDelimiter));
          const script = createScriptDataWithoutCallOrCodes()
            .withCode(duplicatedCode);
          // act
          const act = () => new TestContext()
            .withData(script)
            .withCollectionUtilities(collectionUtilities);
          // assert
          expect(act).to.not.throw();
        });
      });
      describe('validates a expected', () => {
        it('validates script with inline code (that is not compiled)', () => {
          // arrange
          const expectedRules = [
            NoEmptyLines,
            NoDuplicatedLines,
          ];
          const expectedCode = 'expected code to be validated';
          const expectedRevertCode = 'expected revert code to be validated';
          const expectedCodeCalls = [
            expectedCode,
            expectedRevertCode,
          ];
          const validator = new CodeValidatorStub();
          const scriptCodeFactory = createScriptCodeFactoryStub({
            scriptCode: new ScriptCodeStub()
              .withExecute(expectedCode)
              .withRevert(expectedRevertCode),
          });
          // act
          new TestContext()
            .withScriptCodeFactory(scriptCodeFactory)
            .withCodeValidator(validator)
            .parseScript();
          // assert
          validator.assertHistory({
            validatedCodes: expectedCodeCalls,
            rules: expectedRules,
          });
        });
        it('does not validate compiled code', () => {
          // arrange
          const expectedRules = [];
          const expectedCodeCalls = [];
          const validator = new CodeValidatorStub();
          const script = createScriptDataWithCall();
          const compiler = new ScriptCompilerStub()
            .withCompileAbility(script, new ScriptCodeStub());
          const collectionUtilities = new CategoryCollectionSpecificUtilitiesStub()
            .withCompiler(compiler);
          // act
          new TestContext()
            .withData(script)
            .withCodeValidator(validator)
            .withCollectionUtilities(collectionUtilities)
            .parseScript();
          // assert
          validator.assertHistory({
            validatedCodes: expectedCodeCalls,
            rules: expectedRules,
          });
        });
      });
    });
    describe('script creation', () => {
      it('creates script from the factory', () => {
        // arrange
        const expectedScript = new ScriptStub('expected-script');
        const scriptFactory: ScriptFactory = () => expectedScript;
        // act
        const actualScript = new TestContext()
          .withScriptFactory(scriptFactory)
          .parseScript();
        // assert
        expect(actualScript).to.equal(expectedScript);
      });
      describe('rethrows exception if script factory fails', () => {
        // arrange
        const givenData = createScriptDataWithCode();
        const expectedContextMessage = 'Failed to parse script.';
        const expectedError = new Error();
        const validatorFactory: ExecutableValidatorFactory = () => {
          const validatorStub = new ExecutableValidatorStub();
          validatorStub.createContextualErrorMessage = (message) => message;
          return validatorStub;
        };
        // act & assert
        itThrowsContextualError({
          throwingAction: (wrapError) => {
            const factoryMock: ScriptFactory = () => {
              throw expectedError;
            };
            new TestContext()
              .withScriptFactory(factoryMock)
              .withErrorWrapper(wrapError)
              .withValidatorFactory(validatorFactory)
              .withData(givenData)
              .parseScript();
          },
          expectedWrappedError: expectedError,
          expectedContextMessage,
        });
      });
    });
  });
});

class TestContext {
  private data: ScriptData = createScriptDataWithCode();

  private collectionUtilities
  : CategoryCollectionSpecificUtilities = new CategoryCollectionSpecificUtilitiesStub();

  private levelParser: EnumParser<RecommendationLevel> = new EnumParserStub<RecommendationLevel>()
    .setupDefaultValue(RecommendationLevel.Standard);

  private scriptFactory: ScriptFactory = createScriptFactorySpy().scriptFactorySpy;

  private codeValidator: ICodeValidator = new CodeValidatorStub();

  private errorWrapper: ErrorWithContextWrapper = new ErrorWrapperStub().get();

  private validatorFactory: ExecutableValidatorFactory = createExecutableValidatorFactoryStub;

  private docsParser: DocsParser = () => ['docs'];

  private scriptCodeFactory: ScriptCodeFactory = createScriptCodeFactoryStub({
    defaultCodePrefix: TestContext.name,
  });

  public withCodeValidator(codeValidator: ICodeValidator): this {
    this.codeValidator = codeValidator;
    return this;
  }

  public withData(data: ScriptData): this {
    this.data = data;
    return this;
  }

  public withCollectionUtilities(
    collectionUtilities: CategoryCollectionSpecificUtilities,
  ): this {
    this.collectionUtilities = collectionUtilities;
    return this;
  }

  public withParser(parser: EnumParser<RecommendationLevel>): this {
    this.levelParser = parser;
    return this;
  }

  public withScriptFactory(scriptFactory: ScriptFactory): this {
    this.scriptFactory = scriptFactory;
    return this;
  }

  public withValidatorFactory(validatorFactory: ExecutableValidatorFactory): this {
    this.validatorFactory = validatorFactory;
    return this;
  }

  public withErrorWrapper(errorWrapper: ErrorWithContextWrapper): this {
    this.errorWrapper = errorWrapper;
    return this;
  }

  public withScriptCodeFactory(scriptCodeFactory: ScriptCodeFactory): this {
    this.scriptCodeFactory = scriptCodeFactory;
    return this;
  }

  public withDocsParser(docsParser: DocsParser): this {
    this.docsParser = docsParser;
    return this;
  }

  public parseScript(): ReturnType<typeof parseScript> {
    return parseScript(
      this.data,
      this.collectionUtilities,
      {
        levelParser: this.levelParser,
        createScript: this.scriptFactory,
        codeValidator: this.codeValidator,
        wrapError: this.errorWrapper,
        createValidator: this.validatorFactory,
        createCode: this.scriptCodeFactory,
        parseDocs: this.docsParser,
      },
    );
  }
}
