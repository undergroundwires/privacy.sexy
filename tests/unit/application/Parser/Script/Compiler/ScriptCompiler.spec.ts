import { describe, it, expect } from 'vitest';
import type { FunctionData } from '@/application/collections/';
import { ScriptCode } from '@/domain/ScriptCode';
import { ScriptCompiler } from '@/application/Parser/Script/Compiler/ScriptCompiler';
import type { ISharedFunctionsParser } from '@/application/Parser/Script/Compiler/Function/ISharedFunctionsParser';
import type { CompiledCode } from '@/application/Parser/Script/Compiler/Function/Call/Compiler/CompiledCode';
import type { FunctionCallCompiler } from '@/application/Parser/Script/Compiler/Function/Call/Compiler/FunctionCallCompiler';
import { LanguageSyntaxStub } from '@tests/unit/shared/Stubs/LanguageSyntaxStub';
import { createFunctionDataWithCode } from '@tests/unit/shared/Stubs/FunctionDataStub';
import { FunctionCallCompilerStub } from '@tests/unit/shared/Stubs/FunctionCallCompilerStub';
import { SharedFunctionsParserStub } from '@tests/unit/shared/Stubs/SharedFunctionsParserStub';
import { SharedFunctionCollectionStub } from '@tests/unit/shared/Stubs/SharedFunctionCollectionStub';
import { parseFunctionCalls } from '@/application/Parser/Script/Compiler/Function/Call/FunctionCallParser';
import { FunctionCallDataStub } from '@tests/unit/shared/Stubs/FunctionCallDataStub';
import type { ILanguageSyntax } from '@/application/Parser/Script/Validation/Syntax/ILanguageSyntax';
import type { ICodeValidator } from '@/application/Parser/Script/Validation/ICodeValidator';
import { CodeValidatorStub } from '@tests/unit/shared/Stubs/CodeValidatorStub';
import { NoEmptyLines } from '@/application/Parser/Script/Validation/Rules/NoEmptyLines';
import { CompiledCodeStub } from '@tests/unit/shared/Stubs/CompiledCodeStub';
import { collectExceptionMessage } from '@tests/unit/shared/ExceptionCollector';
import { createScriptDataWithCall, createScriptDataWithCode } from '@tests/unit/shared/Stubs/ScriptDataStub';

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
    it('returns code as expected', () => {
      // arrange
      const expected: CompiledCode = {
        code: 'expected-code',
        revertCode: 'expected-revert-code',
      };
      const call = new FunctionCallDataStub();
      const script = createScriptDataWithCall(call);
      const functions = [createFunctionDataWithCode().withName('existing-func')];
      const compiledFunctions = new SharedFunctionCollectionStub();
      const functionParserMock = new SharedFunctionsParserStub();
      functionParserMock.setup(functions, compiledFunctions);
      const callCompilerMock = new FunctionCallCompilerStub();
      callCompilerMock.setup(parseFunctionCalls(call), compiledFunctions, expected);
      const sut = new ScriptCompilerBuilder()
        .withFunctions(...functions)
        .withSharedFunctionsParser(functionParserMock)
        .withFunctionCallCompiler(callCompilerMock)
        .build();
      // act
      const code = sut.compile(script);
      // assert
      expect(code.execute).to.equal(expected.code);
      expect(code.revert).to.equal(expected.revertCode);
    });
    describe('parses functions as expected', () => {
      it('parses functions with expected syntax', () => {
        // arrange
        const expected: ILanguageSyntax = new LanguageSyntaxStub();
        const parser = new SharedFunctionsParserStub();
        const sut = new ScriptCompilerBuilder()
          .withSomeFunctions()
          .withSyntax(expected)
          .withSharedFunctionsParser(parser)
          .build();
        const scriptData = createScriptDataWithCall();
        // act
        sut.compile(scriptData);
        // assert
        expect(parser.callHistory.length).to.equal(1);
        expect(parser.callHistory[0].syntax).to.equal(expected);
      });
      it('parses given functions', () => {
        // arrange
        const expectedFunctions = [createFunctionDataWithCode().withName('existing-func')];
        const parser = new SharedFunctionsParserStub();
        const sut = new ScriptCompilerBuilder()
          .withFunctions(...expectedFunctions)
          .withSharedFunctionsParser(parser)
          .build();
        const scriptData = createScriptDataWithCall();
        // act
        sut.compile(scriptData);
        // assert
        expect(parser.callHistory.length).to.equal(1);
        expect(parser.callHistory[0].functions).to.deep.equal(expectedFunctions);
      });
    });
    it('rethrows error with script name', () => {
      // arrange
      const scriptName = 'scriptName';
      const innerError = 'innerError';
      const expectedError = `Script "${scriptName}" ${innerError}`;
      const callCompiler: FunctionCallCompiler = {
        compileFunctionCalls: () => { throw new Error(innerError); },
      };
      const scriptData = createScriptDataWithCall()
        .withName(scriptName);
      const sut = new ScriptCompilerBuilder()
        .withSomeFunctions()
        .withFunctionCallCompiler(callCompiler)
        .build();
      // act
      const act = () => sut.compile(scriptData);
      // assert
      expect(act).to.throw(expectedError);
    });
    it('rethrows error from ScriptCode with script name', () => {
      // arrange
      const scriptName = 'scriptName';
      const syntax = new LanguageSyntaxStub();
      const invalidCode = new CompiledCodeStub()
        .withCode('' /* invalid code (empty string) */);
      const realExceptionMessage = collectExceptionMessage(
        () => new ScriptCode(invalidCode.code, invalidCode.revertCode),
      );
      const expectedError = `Script "${scriptName}" ${realExceptionMessage}`;
      const callCompiler: FunctionCallCompiler = {
        compileFunctionCalls: () => invalidCode,
      };
      const scriptData = createScriptDataWithCall()
        .withName(scriptName);
      const sut = new ScriptCompilerBuilder()
        .withSomeFunctions()
        .withFunctionCallCompiler(callCompiler)
        .withSyntax(syntax)
        .build();
      // act
      const act = () => sut.compile(scriptData);
      // assert
      expect(act).to.throw(expectedError);
    });
    it('validates compiled code as expected', () => {
      // arrange
      const expectedRules = [
        NoEmptyLines,
        // Allow duplicated lines to enable calling same function multiple times
      ];
      const scriptData = createScriptDataWithCall();
      const validator = new CodeValidatorStub();
      const sut = new ScriptCompilerBuilder()
        .withSomeFunctions()
        .withCodeValidator(validator)
        .build();
      // act
      const compilationResult = sut.compile(scriptData);
      // assert
      validator.assertHistory({
        validatedCodes: [compilationResult.execute, compilationResult.revert],
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

  private sharedFunctionsParser: ISharedFunctionsParser = new SharedFunctionsParserStub();

  private callCompiler: FunctionCallCompiler = new FunctionCallCompilerStub();

  private codeValidator: ICodeValidator = new CodeValidatorStub();

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
    sharedFunctionsParser: ISharedFunctionsParser,
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

  public build(): ScriptCompiler {
    if (!this.functions) {
      throw new Error('Function behavior not defined');
    }
    return new ScriptCompiler(
      this.functions,
      this.syntax,
      this.sharedFunctionsParser,
      this.callCompiler,
      this.codeValidator,
    );
  }
}
