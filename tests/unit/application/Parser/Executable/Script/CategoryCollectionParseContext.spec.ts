import { describe, it, expect } from 'vitest';
import type { ISyntaxFactory } from '@/application/Parser/Executable/Script/Validation/Syntax/ISyntaxFactory';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
<<<<<<<< HEAD:tests/unit/application/Parser/Exec@/application/Parser/Executable/CategoryCollectionParseContext
import { CategoryCollectionParseContext } from '@/application/Parser/Executable/Script/CategoryCollectionParseContext';
import { ScriptCompiler } from '@/application/Parser/Executable/Script/Compiler/ScriptCompiler';
========
import { CategoryCollectionParseContextFacade } from '@/application/Parser/Script/CategoryCollectionParseContextFacade';
import { ScriptCompiler } from '@/application/Parser/Script/Compiler/ScriptCompiler';
>>>>>>>> defa2601 (Add unique script/category IDs $49, $59, $262, $126):tests/unit/application/Parser/Executable/Script/CategoryCollectionParseContextFacade.spec.ts
import { LanguageSyntaxStub } from '@tests/unit/shared/Stubs/LanguageSyntaxStub';
import { ScriptingDefinitionStub } from '@tests/unit/shared/Stubs/ScriptingDefinitionStub';
import type { FunctionData } from '@/application/collections/';
import { itEachAbsentCollectionValue } from '@tests/unit/shared/TestCases/AbsentTests';
import type { ILanguageSyntax } from '@/application/Parser/Executable/Script/Validation/Syntax/ILanguageSyntax';
import { createFunctionDataWithCode } from '@tests/unit/shared/Stubs/FunctionDataStub';

describe('CategoryCollectionParseContextFacade', () => {
  describe('ctor', () => {
    describe('functionsData', () => {
      describe('can create with absent data', () => {
        itEachAbsentCollectionValue<FunctionData>((absentValue) => {
          // arrange
          const scripting = new ScriptingDefinitionStub();
          // act
          const act = () => new CategoryCollectionParseContextFacade(absentValue, scripting);
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
      const expected = new ScriptCompiler(functionsData, syntax);
      const language = ScriptingLanguage.shellscript;
      const factoryMock = mockFactory(language, syntax);
      const definition = new ScriptingDefinitionStub()
        .withLanguage(language);
      // act
      const sut = new CategoryCollectionParseContextFacade(functionsData, definition, factoryMock);
      const actual = sut.compiler;
      // assert
      expect(actual).to.deep.equal(expected);
    });
  });
  describe('syntax', () => {
    it('set from syntax factory', () => {
      // arrange
      const language = ScriptingLanguage.shellscript;
      const expected = new LanguageSyntaxStub();
      const factoryMock = mockFactory(language, expected);
      const definition = new ScriptingDefinitionStub()
        .withLanguage(language);
      // act
      const sut = new CategoryCollectionParseContextFacade([], definition, factoryMock);
      const actual = sut.syntax;
      // assert
      expect(actual).to.equal(expected);
    });
  });
});

function mockFactory(expectedLanguage: ScriptingLanguage, result: ILanguageSyntax): ISyntaxFactory {
  return {
    create: (language: ScriptingLanguage) => {
      if (language !== expectedLanguage) {
        throw new Error('unexpected language');
      }
      return result;
    },
  };
}
