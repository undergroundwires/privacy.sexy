import { expect, describe, it } from 'vitest';
import { InlineFunctionCallCompiler } from '@/application/Parser/Script/Compiler/Function/Call/Compiler/SingleCall/Strategies/InlineFunctionCallCompiler';
import { SharedFunctionStub } from '@tests/unit/shared/Stubs/SharedFunctionStub';
import { FunctionBodyType } from '@/application/Parser/Script/Compiler/Function/ISharedFunction';
import { ExpressionsCompilerStub } from '@tests/unit/shared/Stubs/ExpressionsCompilerStub';
import { IExpressionsCompiler } from '@/application/Parser/Script/Compiler/Expressions/IExpressionsCompiler';
import { FunctionCallStub } from '@tests/unit/shared/Stubs/FunctionCallStub';
import { FunctionCallArgumentCollectionStub } from '@tests/unit/shared/Stubs/FunctionCallArgumentCollectionStub';

describe('InlineFunctionCallCompiler', () => {
  describe('canCompile', () => {
    it('returns `true` if function has code body', () => {
      // arrange
      const expected = true;
      const func = new SharedFunctionStub(FunctionBodyType.Code);
      const compiler = new InlineFunctionCallCompilerBuilder()
        .build();
      // act
      const actual = compiler.canCompile(func);
      // assert
      expect(actual).to.equal(expected);
    });
    it('returns `false` if function does not have code body', () => {
      // arrange
      const expected = false;
      const func = new SharedFunctionStub(FunctionBodyType.Calls);
      const compiler = new InlineFunctionCallCompilerBuilder()
        .build();
      // act
      const actual = compiler.canCompile(func);
      // assert
      expect(actual).to.equal(expected);
    });
  });
  describe('compile', () => {
    it('compiles expressions with correct arguments', () => {
      // arrange
      const expressionsCompilerStub = new ExpressionsCompilerStub();
      const expectedArgs = new FunctionCallArgumentCollectionStub();
      const compiler = new InlineFunctionCallCompilerBuilder()
        .withExpressionsCompiler(expressionsCompilerStub)
        .build();
      // act
      compiler.compileFunction(
        new SharedFunctionStub(FunctionBodyType.Code),
        new FunctionCallStub()
          .withArgumentCollection(expectedArgs),
      );
      // assert
      const actualArgs = expressionsCompilerStub.callHistory.map((call) => call.args[1]);
      expect(actualArgs.every((arg) => arg === expectedArgs));
    });
    it('creates compiled code with compiled `execute`', () => {
      // arrange
      const func = new SharedFunctionStub(FunctionBodyType.Code);
      const args = new FunctionCallArgumentCollectionStub();
      const expectedCode = 'expected-code';
      const expressionsCompilerStub = new ExpressionsCompilerStub()
        .setup({
          givenCode: func.body.code.execute,
          givenArgs: args,
          result: expectedCode,
        });
      const compiler = new InlineFunctionCallCompilerBuilder()
        .withExpressionsCompiler(expressionsCompilerStub)
        .build();
      // act
      const compiledCodes = compiler
        .compileFunction(func, new FunctionCallStub().withArgumentCollection(args));
      // assert
      expect(compiledCodes).to.have.lengthOf(1);
      const actualCode = compiledCodes[0].code;
      expect(actualCode).to.equal(expectedCode);
    });
    it('creates compiled revert code with compiled `revert`', () => {
      // arrange
      const func = new SharedFunctionStub(FunctionBodyType.Code);
      const args = new FunctionCallArgumentCollectionStub();
      const expectedRevertCode = 'expected-revert-code';
      const expressionsCompilerStub = new ExpressionsCompilerStub()
        .setup({
          givenCode: func.body.code.revert,
          givenArgs: args,
          result: expectedRevertCode,
        });
      const compiler = new InlineFunctionCallCompilerBuilder()
        .withExpressionsCompiler(expressionsCompilerStub)
        .build();
      // act
      const compiledCodes = compiler
        .compileFunction(func, new FunctionCallStub().withArgumentCollection(args));
      // assert
      expect(compiledCodes).to.have.lengthOf(1);
      const actualRevertCode = compiledCodes[0].revertCode;
      expect(actualRevertCode).to.equal(expectedRevertCode);
    });
  });
});

class InlineFunctionCallCompilerBuilder {
  private expressionsCompiler: IExpressionsCompiler = new ExpressionsCompilerStub();

  public build(): InlineFunctionCallCompiler {
    return new InlineFunctionCallCompiler(this.expressionsCompiler);
  }

  public withExpressionsCompiler(expressionsCompiler: IExpressionsCompiler): this {
    this.expressionsCompiler = expressionsCompiler;
    return this;
  }
}
