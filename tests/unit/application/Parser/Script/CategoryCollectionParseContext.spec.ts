import 'mocha';
import { expect } from 'chai';
import { ISyntaxFactory } from '@/application/Parser/Script/Syntax/ISyntaxFactory';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { CategoryCollectionParseContext } from '@/application/Parser/Script/CategoryCollectionParseContext';
import { ILanguageSyntax } from '@/domain/ScriptCode';
import { ScriptCompiler } from '@/application/Parser/Script/Compiler/ScriptCompiler';
import { LanguageSyntaxStub } from '@tests/unit/stubs/LanguageSyntaxStub';
import { ScriptingDefinitionStub } from '@tests/unit/stubs/ScriptingDefinitionStub';
import { FunctionDataStub } from '@tests/unit/stubs/FunctionDataStub';
import { itEachAbsentCollectionValue, itEachAbsentObjectValue } from '@tests/unit/shared/TestCases/AbsentTests';

describe('CategoryCollectionParseContext', () => {
  describe('ctor', () => {
    describe('functionsData', () => {
      describe('can create with absent data', () => {
        itEachAbsentCollectionValue((absentValue) => {
          // arrange
          const scripting = new ScriptingDefinitionStub();
          // act
          const act = () => new CategoryCollectionParseContext(absentValue, scripting);
          // assert
          expect(act).to.not.throw();
        });
      });
    });
    describe('scripting', () => {
      describe('throws when missing', () => {
        itEachAbsentObjectValue((absentValue) => {
          // arrange
          const expectedError = 'missing scripting';
          const scripting = absentValue;
          const functionsData = [FunctionDataStub.createWithCode()];
          // act
          const act = () => new CategoryCollectionParseContext(functionsData, scripting);
          // assert
          expect(act).to.throw(expectedError);
        });
      });
    });
  });
  describe('compiler', () => {
    it('constructed as expected', () => {
      // arrange
      const functionsData = [FunctionDataStub.createWithCode()];
      const syntax = new LanguageSyntaxStub();
      const expected = new ScriptCompiler(functionsData, syntax);
      const language = ScriptingLanguage.shellscript;
      const factoryMock = mockFactory(language, syntax);
      const definition = new ScriptingDefinitionStub()
        .withLanguage(language);
      // act
      const sut = new CategoryCollectionParseContext(functionsData, definition, factoryMock);
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
      const sut = new CategoryCollectionParseContext([], definition, factoryMock);
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
