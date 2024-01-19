import { describe, it, expect } from 'vitest';
import type { ScriptData } from '@/application/collections/';
import { parseScript, ScriptFactoryType } from '@/application/Parser/Script/ScriptParser';
import { parseDocs } from '@/application/Parser/DocumentationParser';
import { RecommendationLevel } from '@/domain/RecommendationLevel';
import { ICategoryCollectionParseContext } from '@/application/Parser/Script/ICategoryCollectionParseContext';
import { itEachAbsentStringValue } from '@tests/unit/shared/TestCases/AbsentTests';
import { ScriptCompilerStub } from '@tests/unit/shared/Stubs/ScriptCompilerStub';
import { createScriptDataWithCall, createScriptDataWithCode, createScriptDataWithoutCallOrCodes } from '@tests/unit/shared/Stubs/ScriptDataStub';
import { EnumParserStub } from '@tests/unit/shared/Stubs/EnumParserStub';
import { ScriptCodeStub } from '@tests/unit/shared/Stubs/ScriptCodeStub';
import { CategoryCollectionParseContextStub } from '@tests/unit/shared/Stubs/CategoryCollectionParseContextStub';
import { LanguageSyntaxStub } from '@tests/unit/shared/Stubs/LanguageSyntaxStub';
import { NodeType } from '@/application/Parser/NodeValidation/NodeType';
import { expectThrowsNodeError, ITestScenario, NodeValidationTestRunner } from '@tests/unit/application/Parser/NodeValidation/NodeValidatorTestRunner';
import { Script } from '@/domain/Script';
import { IEnumParser } from '@/application/Common/Enum';
import { NoEmptyLines } from '@/application/Parser/Script/Validation/Rules/NoEmptyLines';
import { NoDuplicatedLines } from '@/application/Parser/Script/Validation/Rules/NoDuplicatedLines';
import { CodeValidatorStub } from '@tests/unit/shared/Stubs/CodeValidatorStub';
import { ICodeValidator } from '@/application/Parser/Script/Validation/ICodeValidator';

describe('ScriptParser', () => {
  describe('parseScript', () => {
    it('parses name as expected', () => {
      // arrange
      const expected = 'test-expected-name';
      const script = createScriptDataWithCode()
        .withName(expected);
      // act
      const actual = new TestBuilder()
        .withData(script)
        .parseScript();
      // assert
      expect(actual.name).to.equal(expected);
    });
    it('parses docs as expected', () => {
      // arrange
      const docs = ['https://expected-doc1.com', 'https://expected-doc2.com'];
      const script = createScriptDataWithCode()
        .withDocs(docs);
      const expected = parseDocs(script);
      // act
      const actual = new TestBuilder()
        .withData(script)
        .parseScript();
      // assert
      expect(actual.docs).to.deep.equal(expected);
    });
    describe('level', () => {
      describe('accepts absent level', () => {
        itEachAbsentStringValue((absentValue) => {
          // arrange
          const script = createScriptDataWithCode()
            .withRecommend(absentValue);
          // act
          const actual = new TestBuilder()
            .withData(script)
            .parseScript();
          // assert
          expect(actual.level).to.equal(undefined);
        }, { excludeNull: true });
      });
      it('parses level as expected', () => {
        // arrange
        const expectedLevel = RecommendationLevel.Standard;
        const expectedName = 'level';
        const levelText = 'standard';
        const script = createScriptDataWithCode()
          .withRecommend(levelText);
        const parserMock = new EnumParserStub<RecommendationLevel>()
          .setup(expectedName, levelText, expectedLevel);
        // act
        const actual = new TestBuilder()
          .withData(script)
          .withParser(parserMock)
          .parseScript();
        // assert
        expect(actual.level).to.equal(expectedLevel);
      });
    });
    describe('code', () => {
      it('parses "execute" as expected', () => {
        // arrange
        const expected = 'expected-code';
        const script = createScriptDataWithCode()
          .withCode(expected);
        // act
        const parsed = new TestBuilder()
          .withData(script)
          .parseScript();
        // assert
        const actual = parsed.code.execute;
        expect(actual).to.equal(expected);
      });
      it('parses "revert" as expected', () => {
        // arrange
        const expected = 'expected-revert-code';
        const script = createScriptDataWithCode()
          .withRevertCode(expected);
        // act
        const parsed = new TestBuilder()
          .withData(script)
          .parseScript();
        // assert
        const actual = parsed.code.revert;
        expect(actual).to.equal(expected);
      });
      describe('compiler', () => {
        it('gets code from compiler', () => {
          // arrange
          const expected = new ScriptCodeStub();
          const script = createScriptDataWithCode();
          const compiler = new ScriptCompilerStub()
            .withCompileAbility(script, expected);
          const parseContext = new CategoryCollectionParseContextStub()
            .withCompiler(compiler);
          // act
          const parsed = new TestBuilder()
            .withData(script)
            .withContext(parseContext)
            .parseScript();
          // assert
          const actual = parsed.code;
          expect(actual).to.equal(expected);
        });
      });
      describe('syntax', () => {
        it('set from the context', () => { // tests through script validation logic
          // arrange
          const commentDelimiter = 'should not throw';
          const duplicatedCode = `${commentDelimiter} duplicate-line\n${commentDelimiter} duplicate-line`;
          const parseContext = new CategoryCollectionParseContextStub()
            .withSyntax(new LanguageSyntaxStub().withCommentDelimiters(commentDelimiter));
          const script = createScriptDataWithoutCallOrCodes()
            .withCode(duplicatedCode);
          // act
          const act = () => new TestBuilder()
            .withData(script)
            .withContext(parseContext);
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
          const validator = new CodeValidatorStub();
          const script = createScriptDataWithCode()
            .withCode('expected code to be validated')
            .withRevertCode('expected revert code to be validated');
          // act
          new TestBuilder()
            .withData(script)
            .withCodeValidator(validator)
            .parseScript();
          // assert
          validator.assertHistory({
            validatedCodes: [script.code, script.revertCode],
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
          const parseContext = new CategoryCollectionParseContextStub()
            .withCompiler(compiler);
          // act
          new TestBuilder()
            .withData(script)
            .withCodeValidator(validator)
            .withContext(parseContext)
            .parseScript();
          // assert
          validator.assertHistory({
            validatedCodes: expectedCodeCalls,
            rules: expectedRules,
          });
        });
      });
    });
    describe('invalid script data', () => {
      describe('validates script data', () => {
        // arrange
        const createTest = (script: ScriptData): ITestScenario => ({
          act: () => new TestBuilder()
            .withData(script)
            .parseScript(),
          expectedContext: {
            type: NodeType.Script,
            selfNode: script,
          },
        });
        // act and assert
        new NodeValidationTestRunner()
          .testInvalidNodeName((invalidName) => {
            return createTest(
              createScriptDataWithCall().withName(invalidName),
            );
          })
          .testMissingNodeData((node) => {
            return createTest(node as ScriptData);
          })
          .runThrowingCase({
            name: 'throws when both function call and code are defined',
            scenario: createTest(
              createScriptDataWithCall().withCode('code'),
            ),
            expectedMessage: 'Both "call" and "code" are defined.',
          })
          .runThrowingCase({
            name: 'throws when both function call and revertCode are defined',
            scenario: createTest(
              createScriptDataWithCall().withRevertCode('revert-code'),
            ),
            expectedMessage: 'Both "call" and "revertCode" are defined.',
          })
          .runThrowingCase({
            name: 'throws when neither call or revertCode are defined',
            scenario: createTest(
              createScriptDataWithoutCallOrCodes(),
            ),
            expectedMessage: 'Neither "call" or "code" is defined.',
          });
      });
      it(`rethrows exception if ${Script.name} cannot be constructed`, () => {
        // arrange
        const expectedError = 'script creation failed';
        const factoryMock: ScriptFactoryType = () => { throw new Error(expectedError); };
        const data = createScriptDataWithCode();
        // act
        const act = () => new TestBuilder()
          .withData(data)
          .withFactory(factoryMock)
          .parseScript();
        // expect
        expectThrowsNodeError({
          act,
          expectedContext: {
            type: NodeType.Script,
            selfNode: data,
          },
        }, expectedError);
      });
    });
  });
});

class TestBuilder {
  private data: ScriptData = createScriptDataWithCode();

  private context: ICategoryCollectionParseContext = new CategoryCollectionParseContextStub();

  private parser: IEnumParser<RecommendationLevel> = new EnumParserStub<RecommendationLevel>()
    .setupDefaultValue(RecommendationLevel.Standard);

  private factory?: ScriptFactoryType = undefined;

  private codeValidator: ICodeValidator = new CodeValidatorStub();

  public withCodeValidator(codeValidator: ICodeValidator) {
    this.codeValidator = codeValidator;
    return this;
  }

  public withData(data: ScriptData) {
    this.data = data;
    return this;
  }

  public withContext(context: ICategoryCollectionParseContext) {
    this.context = context;
    return this;
  }

  public withParser(parser: IEnumParser<RecommendationLevel>) {
    this.parser = parser;
    return this;
  }

  public withFactory(factory: ScriptFactoryType) {
    this.factory = factory;
    return this;
  }

  public parseScript(): Script {
    return parseScript(this.data, this.context, this.parser, this.factory, this.codeValidator);
  }
}
