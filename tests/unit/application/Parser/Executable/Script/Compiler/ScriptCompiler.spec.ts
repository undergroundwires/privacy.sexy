import { describe, it, expect } from 'vitest';
import type { FunctionData } from '@/application/collections/';
import { ScriptCompiler } from '@/application/Parser/Executable/Script/Compiler/ScriptCompiler';
import type { FunctionCallCompiler } from '@/application/Parser/Executable/Script/Compiler/Function/Call/Compiler/FunctionCallCompiler';
import { LanguageSyntaxStub } from '@tests/unit/shared/Stubs/LanguageSyntaxStub';
import { createFunctionDataWithCode } from '@tests/unit/shared/Stubs/FunctionDataStub';
import { FunctionCallCompilerStub } from '@tests/unit/shared/Stubs/FunctionCallCompilerStub';
import { createSharedFunctionsParserStub } from '@tests/unit/shared/Stubs/SharedFunctionsParserStub';
import { SharedFunctionCollectionStub } from '@tests/unit/shared/Stubs/SharedFunctionCollectionStub';
import { parseFunctionCalls } from '@/application/Parser/Executable/Script/Compiler/Function/Call/FunctionCallsParser';
import { FunctionCallDataStub } from '@tests/unit/shared/Stubs/FunctionCallDataStub';
import type { ILanguageSyntax } from '@/application/Parser/Executable/Script/Validation/Syntax/ILanguageSyntax';
import type { ICodeValidator } from '@/application/Parser/Executable/Script/Validation/ICodeValidator';
import { CodeValidatorStub } from '@tests/unit/shared/Stubs/CodeValidatorStub';
import { NoEmptyLines } from '@/application/Parser/Executable/Script/Validation/Rules/NoEmptyLines';
import { CompiledCodeStub } from '@tests/unit/shared/Stubs/CompiledCodeStub';
import { createScriptDataWithCall, createScriptDataWithCode } from '@tests/unit/shared/Stubs/ScriptDataStub';
import type { ErrorWithContextWrapper } from '@/application/Parser/ContextualError';
import { errorWithContextWrapperStub } from '@tests/unit/shared/Stubs/ErrorWithContextWrapperStub';
import { ScriptCodeStub } from '@tests/unit/shared/Stubs/ScriptCodeStub';
import type { ScriptCodeFactory } from '@/domain/Executables/Script/Code/ScriptCodeFactory';
import { createScriptCodeFactoryStub } from '@tests/unit/shared/Stubs/ScriptCodeFactoryStub';
<<<<<<< HEAD
import { itThrowsContextualError } from '@tests/unit/application/Parser/Common/ContextualErrorTester';
import type { SharedFunctionsParser } from '@/application/Parser/Executable/Script/Compiler/Function/SharedFunctionsParser';
=======
import { itThrowsContextualError } from '@tests/unit/application/Parser/ContextualErrorTester';
>>>>>>> cbea6fa3 (Add unique script/category IDs $49, $59, $262, $126)

describe('ScriptCompiler', () => {
  describe('canCompile', () => {
    it('returns true if "call" is defined', () => {
      // arrange
      const sut = new ScriptCompilerBuilder()
        .withEmptyFunctions()
        .build();
      const script = createScriptDataWithCall();
      // act
      const actual = sut.canCompile(script);
      // assert
      expect(actual).to.equal(true);
    });
    it('returns false if "call" is undefined', () => {
      // arrange
      const sut = new ScriptCompilerBuilder()
        .withEmptyFunctions()
        .build();
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
      const sut = new ScriptCompilerBuilder()
        .withSomeFunctions()
        .build();
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
        const sut = new ScriptCompilerBuilder()
          .withSomeFunctions()
          .withScriptCodeFactory(scriptCodeFactory)
          .build();
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
        const sut = new ScriptCompilerBuilder()
          .withFunctions(...functions)
          .withSharedFunctionsParser(functionParserMock.parser)
          .withFunctionCallCompiler(callCompilerMock)
          .withScriptCodeFactory(scriptCodeFactory)
          .build();
        // act
        sut.compile(script);
        // assert
        expect(actualCode).to.equal(expectedCode);
        expect(actualRevertCode).to.equal(expectedRevertCode);
      });
    });

    describe('parses functions as expected', () => {
      it('parses functions with expected syntax', () => {
        // arrange
        const expected: ILanguageSyntax = new LanguageSyntaxStub();
        const functionParserMock = createSharedFunctionsParserStub();
        const sut = new ScriptCompilerBuilder()
          .withSomeFunctions()
          .withSyntax(expected)
          .withSharedFunctionsParser(functionParserMock.parser)
          .build();
        const scriptData = createScriptDataWithCall();
        // act
        sut.compile(scriptData);
        // assert
        const parserCalls = functionParserMock.callHistory;
        expect(parserCalls.length).to.equal(1);
        expect(parserCalls[0].syntax).to.equal(expected);
      });
      it('parses given functions', () => {
        // arrange
        const expectedFunctions = [createFunctionDataWithCode().withName('existing-func')];
        const functionParserMock = createSharedFunctionsParserStub();
        const sut = new ScriptCompilerBuilder()
          .withFunctions(...expectedFunctions)
          .withSharedFunctionsParser(functionParserMock.parser)
          .build();
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
      const builder = new ScriptCompilerBuilder()
        .withSomeFunctions()
        .withFunctionCallCompiler(callCompiler);
      itThrowsContextualError({
        // act
        throwingAction: (wrapError) => {
          builder
            .withErrorWrapper(wrapError)
            .build()
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
      const builder = new ScriptCompilerBuilder()
        .withSomeFunctions()
        .withScriptCodeFactory(scriptCodeFactory);
      itThrowsContextualError({
        // act
        throwingAction: (wrapError) => {
          builder
            .withErrorWrapper(wrapError)
            .build()
            .compile(scriptData);
        },
        // assert
        expectedWrappedError: expectedInnerError,
        expectedContextMessage: expectedErrorMessage,
      });
    });
    it('validates compiled code as expected', () => {
      // arrange
      const expectedRules = [
        NoEmptyLines,
        // Allow duplicated lines to enable calling same function multiple times
      ];
      const expectedExecuteCode = 'execute code to be validated';
      const expectedRevertCode = 'revert code to be validated';
      const scriptData = createScriptDataWithCall();
      const validator = new CodeValidatorStub();
      const sut = new ScriptCompilerBuilder()
        .withSomeFunctions()
        .withCodeValidator(validator)
        .withFunctionCallCompiler(
          new FunctionCallCompilerStub()
            .withDefaultCompiledCode(
              new CompiledCodeStub()
                .withCode(expectedExecuteCode)
                .withRevertCode(expectedRevertCode),
            ),
        )
        .build();
      // act
      sut.compile(scriptData);
      // assert
      validator.assertHistory({
        validatedCodes: [expectedExecuteCode, expectedRevertCode],
        rules: expectedRules,
      });
    });
  });
});

class ScriptCompilerBuilder {
  private static createFunctions(...names: string[]): FunctionData[] {
    return names.map((functionName) => {
      return createFunctionDataWithCode().withName(functionName);
    });
  }

  private functions: FunctionData[] | undefined;

  private syntax: ILanguageSyntax = new LanguageSyntaxStub();

  private sharedFunctionsParser: SharedFunctionsParser = createSharedFunctionsParserStub().parser;

  private callCompiler: FunctionCallCompiler = new FunctionCallCompilerStub();

  private codeValidator: ICodeValidator = new CodeValidatorStub();

  private wrapError: ErrorWithContextWrapper = errorWithContextWrapperStub;

  private scriptCodeFactory: ScriptCodeFactory = createScriptCodeFactoryStub({
    defaultCodePrefix: ScriptCompilerBuilder.name,
  });

  public withFunctions(...functions: FunctionData[]): this {
    this.functions = functions;
    return this;
  }

  public withSomeFunctions(): this {
    this.functions = ScriptCompilerBuilder.createFunctions('test-function');
    return this;
  }

  public withFunctionNames(...functionNames: string[]): this {
    this.functions = ScriptCompilerBuilder.createFunctions(...functionNames);
    return this;
  }

  public withEmptyFunctions(): this {
    this.functions = [];
    return this;
  }

  public withSyntax(syntax: ILanguageSyntax): this {
    this.syntax = syntax;
    return this;
  }

  public withSharedFunctionsParser(
    sharedFunctionsParser: SharedFunctionsParser,
  ): this {
    this.sharedFunctionsParser = sharedFunctionsParser;
    return this;
  }

  public withCodeValidator(
    codeValidator: ICodeValidator,
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

  public build(): ScriptCompiler {
    if (!this.functions) {
      throw new Error('Function behavior not defined');
    }
    return new ScriptCompiler(
      {
        functions: this.functions,
        syntax: this.syntax,
      },
      {
        sharedFunctionsParser: this.sharedFunctionsParser,
        callCompiler: this.callCompiler,
        codeValidator: this.codeValidator,
        wrapError: this.wrapError,
        scriptCodeFactory: this.scriptCodeFactory,
      },
    );
  }
}
