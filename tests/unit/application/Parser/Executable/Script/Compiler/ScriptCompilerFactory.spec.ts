import { describe, it, expect } from 'vitest';
import type { FunctionData } from '@/application/collections/';
import { createScriptCompiler } from '@/application/Parser/Executable/Script/Compiler/ScriptCompilerFactory';
import type { FunctionCallCompiler } from '@/application/Parser/Executable/Script/Compiler/Function/Call/Compiler/FunctionCallCompiler';
import { createFunctionDataWithCode } from '@tests/unit/shared/Stubs/FunctionDataStub';
import { FunctionCallCompilerStub } from '@tests/unit/shared/Stubs/FunctionCallCompilerStub';
import { createSharedFunctionsParserStub } from '@tests/unit/shared/Stubs/SharedFunctionsParserStub';
import { SharedFunctionCollectionStub } from '@tests/unit/shared/Stubs/SharedFunctionCollectionStub';
import { parseFunctionCalls } from '@/application/Parser/Executable/Script/Compiler/Function/Call/FunctionCallsParser';
import { FunctionCallDataStub } from '@tests/unit/shared/Stubs/FunctionCallDataStub';
import type { CodeValidator } from '@/application/Parser/Executable/Script/Validation/CodeValidator';
import { CodeValidatorStub } from '@tests/unit/shared/Stubs/CodeValidatorStub';
import { CompiledCodeStub } from '@tests/unit/shared/Stubs/CompiledCodeStub';
import { createScriptDataWithCall, createScriptDataWithCode } from '@tests/unit/shared/Stubs/ScriptDataStub';
import type { ErrorWithContextWrapper } from '@/application/Compiler/Common/ContextualError';
import { errorWithContextWrapperStub } from '@tests/unit/shared/Stubs/ErrorWithContextWrapperStub';
import { ScriptCodeStub } from '@tests/unit/shared/Stubs/ScriptCodeStub';
import type { ScriptCodeFactory } from '@/domain/Executables/Script/Code/ScriptCodeFactory';
import { createScriptCodeFactoryStub } from '@tests/unit/shared/Stubs/ScriptCodeFactoryStub';
import { itThrowsContextualError } from '@tests/unit/application/Compiler/Common/ContextualErrorTester';
import type { SharedFunctionsParser } from '@/application/Parser/Executable/Script/Compiler/Function/SharedFunctionsParser';
import type { ScriptCompiler } from '@/application/Parser/Executable/Script/Compiler/ScriptCompiler';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { CodeValidationRule } from '@/application/Parser/Executable/Script/Validation/CodeValidationRule';

describe('ScriptCompilerFactory', () => {
  describe('createScriptCompiler', () => {
    describe('canCompile', () => {
      it('returns true if "call" is defined', () => {
        // arrange
        const sut = new TestContext()
          .withEmptyFunctions()
          .create();
        const script = createScriptDataWithCall();
        // act
        const actual = sut.canCompile(script);
        // assert
        expect(actual).to.equal(true);
      });
      it('returns false if "call" is undefined', () => {
        // arrange
        const sut = new TestContext()
          .withEmptyFunctions()
          .create();
        const script = createScriptDataWithCode();
        // act
        const actual = sut.canCompile(script);
        // assert
        expect(actual).to.equal(false);
      });
    });
    describe('compile', () => {
      it('throws if script does not have body', () => {
        // arrange
        const expectedError = 'Script does include any calls.';
        const scriptData = createScriptDataWithCode();
        const sut = new TestContext()
          .withSomeFunctions()
          .create();
        // act
        const act = () => sut.compile(scriptData);
        // assert
        expect(act).to.throw(expectedError);
      });
      describe('code construction', () => {
        it('returns code from the factory', () => {
          // arrange
          const expectedCode = new ScriptCodeStub();
          const scriptCodeFactory = () => expectedCode;
          const sut = new TestContext()
            .withSomeFunctions()
            .withScriptCodeFactory(scriptCodeFactory)
            .create();
          // act
          const actualCode = sut.compile(createScriptDataWithCall());
          // assert
          expect(actualCode).to.equal(expectedCode);
        });
        it('creates code correctly', () => {
          // arrange
          const expectedCode = 'expected-code';
          const expectedRevertCode = 'expected-revert-code';
          let actualCode: string | undefined;
          let actualRevertCode: string | undefined;
          const scriptCodeFactory = (code: string, revertCode: string) => {
            actualCode = code;
            actualRevertCode = revertCode;
            return new ScriptCodeStub();
          };
          const call = new FunctionCallDataStub();
          const script = createScriptDataWithCall(call);
          const functions = [createFunctionDataWithCode().withName('existing-func')];
          const compiledFunctions = new SharedFunctionCollectionStub();
          const functionParserMock = createSharedFunctionsParserStub();
          functionParserMock.setup(functions, compiledFunctions);
          const callCompilerMock = new FunctionCallCompilerStub();
          callCompilerMock.setup(
            parseFunctionCalls(call),
            compiledFunctions,
            new CompiledCodeStub()
              .withCode(expectedCode)
              .withRevertCode(expectedRevertCode),
          );
          const sut = new TestContext()
            .withFunctions(...functions)
            .withSharedFunctionsParser(functionParserMock.parser)
            .withFunctionCallCompiler(callCompilerMock)
            .withScriptCodeFactory(scriptCodeFactory)
            .create();
          // act
          sut.compile(script);
          // assert
          expect(actualCode).to.equal(expectedCode);
          expect(actualRevertCode).to.equal(expectedRevertCode);
        });
      });
      describe('parses functions as expected', () => {
        it('parses functions with expected language', () => {
          // arrange
          const expectedLanguage = ScriptingLanguage.batchfile;
          const functionParserMock = createSharedFunctionsParserStub();
          const sut = new TestContext()
            .withSomeFunctions()
            .withLanguage(expectedLanguage)
            .withSharedFunctionsParser(functionParserMock.parser)
            .create();
          const scriptData = createScriptDataWithCall();
          // act
          sut.compile(scriptData);
          // assert
          const parserCalls = functionParserMock.callHistory;
          expect(parserCalls.length).to.equal(1);
          const actualLanguage = parserCalls[0].language;
          expect(actualLanguage).to.equal(expectedLanguage);
        });
        it('parses given functions', () => {
          // arrange
          const expectedFunctions = [createFunctionDataWithCode().withName('existing-func')];
          const functionParserMock = createSharedFunctionsParserStub();
          const sut = new TestContext()
            .withFunctions(...expectedFunctions)
            .withSharedFunctionsParser(functionParserMock.parser)
            .create();
          const scriptData = createScriptDataWithCall();
          // act
          sut.compile(scriptData);
          // assert
          const parserCalls = functionParserMock.callHistory;
          expect(parserCalls.length).to.equal(1);
          expect(parserCalls[0].functions).to.deep.equal(expectedFunctions);
        });
      });
      describe('rethrows error with script name', () => {
        // arrange
        const scriptName = 'scriptName';
        const expectedErrorMessage = `Failed to compile script: ${scriptName}`;
        const expectedInnerError = new Error();
        const callCompiler: FunctionCallCompiler = {
          compileFunctionCalls: () => { throw expectedInnerError; },
        };
        const scriptData = createScriptDataWithCall()
          .withName(scriptName);
        const builder = new TestContext()
          .withSomeFunctions()
          .withFunctionCallCompiler(callCompiler);
        itThrowsContextualError({
          // act
          throwingAction: (wrapError) => {
            builder
              .withErrorWrapper(wrapError)
              .create()
              .compile(scriptData);
          },
          // assert
          expectedWrappedError: expectedInnerError,
          expectedContextMessage: expectedErrorMessage,
        });
      });
      describe('rethrows error from script code factory with script name', () => {
        // arrange
        const scriptName = 'scriptName';
        const expectedErrorMessage = `Failed to compile script: ${scriptName}`;
        const expectedInnerError = new Error();
        const scriptCodeFactory: ScriptCodeFactory = () => {
          throw expectedInnerError;
        };
        const scriptData = createScriptDataWithCall()
          .withName(scriptName);
        const builder = new TestContext()
          .withSomeFunctions()
          .withScriptCodeFactory(scriptCodeFactory);
        itThrowsContextualError({
          // act
          throwingAction: (wrapError) => {
            builder
              .withErrorWrapper(wrapError)
              .create()
              .compile(scriptData);
          },
          // assert
          expectedWrappedError: expectedInnerError,
          expectedContextMessage: expectedErrorMessage,
        });
      });
      describe('compiled code validation', () => {
        it('validates compiled code', () => {
          // arrange
          const expectedExecuteCode = 'execute code to be validated';
          const expectedRevertCode = 'revert code to be validated';
          const scriptData = createScriptDataWithCall();
          const validator = new CodeValidatorStub();
          const sut = new TestContext()
            .withSomeFunctions()
            .withCodeValidator(validator.get())
            .withFunctionCallCompiler(
              new FunctionCallCompilerStub()
                .withDefaultCompiledCode(
                  new CompiledCodeStub()
                    .withCode(expectedExecuteCode)
                    .withRevertCode(expectedRevertCode),
                ),
            )
            .create();
          // act
          sut.compile(scriptData);
          // assert
          validator.assertValidatedCodes([
            expectedExecuteCode, expectedRevertCode,
          ]);
        });
        it('applies correct validation rules', () => {
          // arrange
          const expectedRules: readonly CodeValidationRule[] = [
            CodeValidationRule.NoEmptyLines,
            CodeValidationRule.NoTooLongLines,
            // Allow duplicated lines to enable calling same function multiple times
          ];
          const scriptData = createScriptDataWithCall();
          const validator = new CodeValidatorStub();
          const sut = new TestContext()
            .withSomeFunctions()
            .withCodeValidator(validator.get())
            .create();
          // act
          sut.compile(scriptData);
          // assert
          validator.assertValidatedRules(expectedRules);
        });
        it('validates for correct scripting language', () => {
          // arrange
          const expectedLanguage: ScriptingLanguage = ScriptingLanguage.shellscript;
          const scriptData = createScriptDataWithCall();
          const validator = new CodeValidatorStub();
          const sut = new TestContext()
            .withSomeFunctions()
            .withLanguage(expectedLanguage)
            .withCodeValidator(validator.get())
            .create();
          // act
          sut.compile(scriptData);
          // assert
          validator.assertValidatedLanguage(expectedLanguage);
        });
      });
    });
  });
});

class TestContext {
  private static createFunctions(...names: string[]): FunctionData[] {
    return names.map((functionName) => {
      return createFunctionDataWithCode().withName(functionName);
    });
  }

  private functions: FunctionData[] | undefined;

  private language: ScriptingLanguage = ScriptingLanguage.batchfile;

  private sharedFunctionsParser: SharedFunctionsParser = createSharedFunctionsParserStub().parser;

  private callCompiler: FunctionCallCompiler = new FunctionCallCompilerStub();

  private codeValidator: CodeValidator = new CodeValidatorStub()
    .get();

  private wrapError: ErrorWithContextWrapper = errorWithContextWrapperStub;

  private scriptCodeFactory: ScriptCodeFactory = createScriptCodeFactoryStub({
    defaultCodePrefix: TestContext.name,
  });

  public withFunctions(...functions: FunctionData[]): this {
    this.functions = functions;
    return this;
  }

  public withSomeFunctions(): this {
    this.functions = TestContext.createFunctions('test-function');
    return this;
  }

  public withFunctionNames(...functionNames: string[]): this {
    this.functions = TestContext.createFunctions(...functionNames);
    return this;
  }

  public withEmptyFunctions(): this {
    this.functions = [];
    return this;
  }

  public withLanguage(language: ScriptingLanguage): this {
    this.language = language;
    return this;
  }

  public withSharedFunctionsParser(
    sharedFunctionsParser: SharedFunctionsParser,
  ): this {
    this.sharedFunctionsParser = sharedFunctionsParser;
    return this;
  }

  public withCodeValidator(
    codeValidator: CodeValidator,
  ): this {
    this.codeValidator = codeValidator;
    return this;
  }

  public withFunctionCallCompiler(callCompiler: FunctionCallCompiler): this {
    this.callCompiler = callCompiler;
    return this;
  }

  public withErrorWrapper(wrapError: ErrorWithContextWrapper): this {
    this.wrapError = wrapError;
    return this;
  }

  public withScriptCodeFactory(scriptCodeFactory: ScriptCodeFactory): this {
    this.scriptCodeFactory = scriptCodeFactory;
    return this;
  }

  public create(): ScriptCompiler {
    if (!this.functions) {
      throw new Error('Function behavior not defined');
    }
    return createScriptCompiler({
      categoryContext: {
        functions: this.functions,
        language: this.language,
      },
      utilities: {
        sharedFunctionsParser: this.sharedFunctionsParser,
        callCompiler: this.callCompiler,
        codeValidator: this.codeValidator,
        wrapError: this.wrapError,
        scriptCodeFactory: this.scriptCodeFactory,
      },
    });
  }
}
