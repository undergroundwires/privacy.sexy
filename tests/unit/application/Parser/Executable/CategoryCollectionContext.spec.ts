import { describe, it, expect } from 'vitest';
import { ScriptLanguage } from '@/domain/ScriptMetadata/ScriptLanguage';
import type { FunctionData } from '@/application/collections/';
import { itEachAbsentCollectionValue } from '@tests/unit/shared/TestCases/AbsentTests';
import { createFunctionDataWithCode } from '@tests/unit/shared/Stubs/FunctionDataStub';
import type { ScriptCompilerFactory } from '@/application/Parser/Executable/Script/Compiler/ScriptCompilerFactory';
import { createCategoryCollectionContext } from '@/application/Parser/Executable/CategoryCollectionContext';
import { createScriptCompilerFactorySpy } from '@tests/unit/shared/Stubs/ScriptCompilerFactoryStub';

describe('CategoryCollectionContext', () => {
  describe('createCategoryCollectionContext', () => {
    describe('functionsData', () => {
      describe('can create with absent data', () => {
        itEachAbsentCollectionValue<FunctionData>((absentValue) => {
          // arrange
          const context = new TextContext()
            .withData(absentValue);
          // act
          const act = () => context.create();
          // assert
          expect(act).to.not.throw();
        }, { excludeNull: true });
      });
    });
  });
  describe('compiler', () => {
    it('constructed with correct functions', () => {
      // arrange
      const expectedFunctions = [createFunctionDataWithCode()];
      const compilerSpy = createScriptCompilerFactorySpy();
      const context = new TextContext()
        .withData(expectedFunctions)
        .withScriptCompilerFactory(compilerSpy.instance);
      // act
      const actualContext = context.create();
      // assert
      const actualCompiler = actualContext.compiler;
      const compilerParameters = compilerSpy.getInitParameters(actualCompiler);
      const actualFunctions = compilerParameters?.categoryContext.functions;
      expect(actualFunctions).to.equal(expectedFunctions);
    });
    it('constructed with correct language', () => {
      // arrange
      const expectedLanguage = ScriptLanguage.batchfile;
      const compilerSpy = createScriptCompilerFactorySpy();
      const context = new TextContext()
        .withLanguage(expectedLanguage)
        .withScriptCompilerFactory(compilerSpy.instance);
      // act
      const actualContext = context.create();
      // assert
      const actualCompiler = actualContext.compiler;
      const compilerParameters = compilerSpy.getInitParameters(actualCompiler);
      const actualLanguage = compilerParameters?.categoryContext.language;
      expect(actualLanguage).to.equal(expectedLanguage);
    });
  });
  describe('language', () => {
    it('set from syntax factory', () => {
      // arrange
      const expectedLanguage = ScriptLanguage.shellscript;
      const context = new TextContext()
        .withLanguage(expectedLanguage);
      // act
      const actualContext = context.create();
      // assert
      const actualLanguage = actualContext.language;
      expect(actualLanguage).to.equal(expectedLanguage);
    });
  });
});

class TextContext {
  private functionsData: readonly FunctionData[] | undefined = [createFunctionDataWithCode()];

  private language: ScriptLanguage = ScriptLanguage.shellscript;

  private scriptCompilerFactory: ScriptCompilerFactory = createScriptCompilerFactorySpy().instance;

  public withScriptCompilerFactory(scriptCompilerFactory: ScriptCompilerFactory): this {
    this.scriptCompilerFactory = scriptCompilerFactory;
    return this;
  }

  public withData(data: readonly FunctionData[] | undefined): this {
    this.functionsData = data;
    return this;
  }

  public withLanguage(language: ScriptLanguage): this {
    this.language = language;
    return this;
  }

  public create(): ReturnType<typeof createCategoryCollectionContext> {
    return createCategoryCollectionContext(
      this.functionsData,
      this.language,
      this.scriptCompilerFactory,
    );
  }
}
