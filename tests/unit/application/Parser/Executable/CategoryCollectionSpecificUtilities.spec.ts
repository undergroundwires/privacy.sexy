import { describe, it, expect } from 'vitest';
import type { ISyntaxFactory } from '@/application/Parser/Executable/Script/Validation/Syntax/ISyntaxFactory';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { LanguageSyntaxStub } from '@tests/unit/shared/Stubs/LanguageSyntaxStub';
import { ScriptingDefinitionStub } from '@tests/unit/shared/Stubs/ScriptingDefinitionStub';
import type { FunctionData } from '@/application/collections/';
import { itEachAbsentCollectionValue } from '@tests/unit/shared/TestCases/AbsentTests';
import { createFunctionDataWithCode } from '@tests/unit/shared/Stubs/FunctionDataStub';
import { ScriptCompiler } from '@/application/Parser/Executable/Script/Compiler/ScriptCompiler';
import { createCollectionUtilities } from '@/application/Parser/Executable/CategoryCollectionSpecificUtilities';
import type { IScriptingDefinition } from '@/domain/IScriptingDefinition';
import { createSyntaxFactoryStub } from '@tests/unit/shared/Stubs/SyntaxFactoryStub';

describe('CategoryCollectionSpecificUtilities', () => {
  describe('createCollectionUtilities', () => {
    describe('functionsData', () => {
      describe('can create with absent data', () => {
        itEachAbsentCollectionValue<FunctionData>((absentValue) => {
          // arrange
          const context = new TextContext()
            .withData(absentValue);
          // act
          const act = () => context.createCollectionUtilities();
          // assert
          expect(act).to.not.throw();
        }, { excludeNull: true });
      });
    });
  });
  describe('compiler', () => {
    it('constructed as expected', () => {
      // arrange
      const functionsData = [createFunctionDataWithCode()];
      const syntax = new LanguageSyntaxStub();
      const expected = new ScriptCompiler({
        functions: functionsData,
        syntax,
      });
      const language = ScriptingLanguage.shellscript;
      const factoryMock = createSyntaxFactoryStub(language, syntax);
      const definition = new ScriptingDefinitionStub()
        .withLanguage(language);
      const context = new TextContext()
        .withData(functionsData)
        .withScripting(definition)
        .withSyntaxFactory(factoryMock);
      // act
      const utilities = context.createCollectionUtilities();
      // assert
      const actual = utilities.compiler;
      expect(actual).to.deep.equal(expected);
    });
  });
  describe('syntax', () => {
    it('set from syntax factory', () => {
      // arrange
      const language = ScriptingLanguage.shellscript;
      const expected = new LanguageSyntaxStub();
      const factoryMock = createSyntaxFactoryStub(language, expected);
      const definition = new ScriptingDefinitionStub()
        .withLanguage(language);
      const context = new TextContext()
        .withScripting(definition)
        .withSyntaxFactory(factoryMock);
      // act
      const utilities = context.createCollectionUtilities();
      // assert
      const actual = utilities.syntax;
      expect(actual).to.equal(expected);
    });
  });
});

class TextContext {
  private functionsData: readonly FunctionData[] | undefined = [createFunctionDataWithCode()];

  private scripting: IScriptingDefinition = new ScriptingDefinitionStub();

  private syntaxFactory: ISyntaxFactory = createSyntaxFactoryStub();

  public withScripting(scripting: IScriptingDefinition): this {
    this.scripting = scripting;
    return this;
  }

  public withData(data: readonly FunctionData[] | undefined): this {
    this.functionsData = data;
    return this;
  }

  public withSyntaxFactory(syntaxFactory: ISyntaxFactory): this {
    this.syntaxFactory = syntaxFactory;
    return this;
  }

  public createCollectionUtilities(): ReturnType<typeof createCollectionUtilities> {
    return createCollectionUtilities(
      this.functionsData,
      this.scripting,
      this.syntaxFactory,
    );
  }
}
