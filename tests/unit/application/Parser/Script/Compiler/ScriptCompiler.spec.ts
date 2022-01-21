import 'mocha';
import { expect } from 'chai';
import { FunctionData } from 'js-yaml-loader!@/*';
import { ILanguageSyntax, ScriptCode } from '@/domain/ScriptCode';
import { ScriptCompiler } from '@/application/Parser/Script/Compiler/ScriptCompiler';
import { ISharedFunctionsParser } from '@/application/Parser/Script/Compiler/Function/ISharedFunctionsParser';
import { ICompiledCode } from '@/application/Parser/Script/Compiler/Function/Call/Compiler/ICompiledCode';
import { IFunctionCallCompiler } from '@/application/Parser/Script/Compiler/Function/Call/Compiler/IFunctionCallCompiler';
import { LanguageSyntaxStub } from '@tests/unit/stubs/LanguageSyntaxStub';
import { ScriptDataStub } from '@tests/unit/stubs/ScriptDataStub';
import { FunctionDataStub } from '@tests/unit/stubs/FunctionDataStub';
import { FunctionCallCompilerStub } from '@tests/unit/stubs/FunctionCallCompilerStub';
import { SharedFunctionsParserStub } from '@tests/unit/stubs/SharedFunctionsParserStub';
import { SharedFunctionCollectionStub } from '@tests/unit/stubs/SharedFunctionCollectionStub';
import { parseFunctionCalls } from '@/application/Parser/Script/Compiler/Function/Call/FunctionCallParser';
import { FunctionCallDataStub } from '@tests/unit/stubs/FunctionCallDataStub';
import { itEachAbsentObjectValue } from '@tests/unit/shared/TestCases/AbsentTests';

describe('ScriptCompiler', () => {
  describe('ctor', () => {
    describe('throws if syntax is missing', () => {
      itEachAbsentObjectValue((absentValue) => {
        // arrange
        const expectedError = 'missing syntax';
        const syntax = absentValue;
        // act
        const act = () => new ScriptCompilerBuilder()
          .withSomeFunctions()
          .withSyntax(syntax)
          .build();
        // assert
        expect(act).to.throw(expectedError);
      });
    });
  });
  describe('canCompile', () => {
    describe('throws if script is missing', () => {
      itEachAbsentObjectValue((absentValue) => {
        // arrange
        const expectedError = 'missing script';
        const argument = absentValue;
        const builder = new ScriptCompilerBuilder()
          .withEmptyFunctions()
          .build();
        // act
        const act = () => builder.canCompile(argument);
        // assert
        expect(act).to.throw(expectedError);
      });
    });
    it('returns true if "call" is defined', () => {
      // arrange
      const sut = new ScriptCompilerBuilder()
        .withEmptyFunctions()
        .build();
      const script = ScriptDataStub.createWithCall();
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
      const script = ScriptDataStub.createWithCode();
      // act
      const actual = sut.canCompile(script);
      // assert
      expect(actual).to.equal(false);
    });
  });
  describe('compile', () => {
    describe('throws if script is missing', () => {
      itEachAbsentObjectValue((absentValue) => {
        // arrange
        const expectedError = 'missing script';
        const argument = absentValue;
        const builder = new ScriptCompilerBuilder()
          .withEmptyFunctions()
          .build();
        // act
        const act = () => builder.compile(argument);
        // assert
        expect(act).to.throw(expectedError);
      });
    });
    it('returns code as expected', () => {
      // arrange
      const expected: ICompiledCode = {
        code: 'expected-code',
        revertCode: 'expected-revert-code',
      };
      const call = new FunctionCallDataStub();
      const script = ScriptDataStub.createWithCall(call);
      const functions = [FunctionDataStub.createWithCode().withName('existing-func')];
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
    it('creates with expected syntax', () => {
      // arrange
      let isUsed = false;
      const syntax: ILanguageSyntax = {
        get commentDelimiters() {
          isUsed = true;
          return [];
        },
        get commonCodeParts() {
          isUsed = true;
          return [];
        },
      };
      const sut = new ScriptCompilerBuilder()
        .withSomeFunctions()
        .withSyntax(syntax)
        .build();
      const scriptData = ScriptDataStub.createWithCall();
      // act
      sut.compile(scriptData);
      // assert
      expect(isUsed).to.equal(true);
    });
    it('rethrows error with script name', () => {
      // arrange
      const scriptName = 'scriptName';
      const innerError = 'innerError';
      const expectedError = `Script "${scriptName}" ${innerError}`;
      const callCompiler: IFunctionCallCompiler = {
        compileCall: () => { throw new Error(innerError); },
      };
      const scriptData = ScriptDataStub.createWithCall()
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
      const invalidCode: ICompiledCode = { code: undefined, revertCode: undefined };
      const realExceptionMessage = collectExceptionMessage(
        () => new ScriptCode(invalidCode.code, invalidCode.revertCode, syntax),
      );
      const expectedError = `Script "${scriptName}" ${realExceptionMessage}`;
      const callCompiler: IFunctionCallCompiler = {
        compileCall: () => invalidCode,
      };
      const scriptData = ScriptDataStub.createWithCall()
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
  });
});

class ScriptCompilerBuilder {
  private static createFunctions(...names: string[]): FunctionData[] {
    return names.map((functionName) => {
      return FunctionDataStub.createWithCode().withName(functionName);
    });
  }

  private functions: FunctionData[];

  private syntax: ILanguageSyntax = new LanguageSyntaxStub();

  private sharedFunctionsParser: ISharedFunctionsParser = new SharedFunctionsParserStub();

  private callCompiler: IFunctionCallCompiler = new FunctionCallCompilerStub();

  public withFunctions(...functions: FunctionData[]): ScriptCompilerBuilder {
    this.functions = functions;
    return this;
  }

  public withSomeFunctions(): ScriptCompilerBuilder {
    this.functions = ScriptCompilerBuilder.createFunctions('test-function');
    return this;
  }

  public withFunctionNames(...functionNames: string[]): ScriptCompilerBuilder {
    this.functions = ScriptCompilerBuilder.createFunctions(...functionNames);
    return this;
  }

  public withEmptyFunctions(): ScriptCompilerBuilder {
    this.functions = [];
    return this;
  }

  public withSyntax(syntax: ILanguageSyntax): ScriptCompilerBuilder {
    this.syntax = syntax;
    return this;
  }

  public withSharedFunctionsParser(
    sharedFunctionsParser: ISharedFunctionsParser,
  ): ScriptCompilerBuilder {
    this.sharedFunctionsParser = sharedFunctionsParser;
    return this;
  }

  public withFunctionCallCompiler(callCompiler: IFunctionCallCompiler): ScriptCompilerBuilder {
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
      this.callCompiler,
      this.sharedFunctionsParser,
    );
  }
}

function collectExceptionMessage(action: () => unknown) {
  let message = '';
  try {
    action();
  } catch (e) {
    message = e.message;
  }
  return message;
}
