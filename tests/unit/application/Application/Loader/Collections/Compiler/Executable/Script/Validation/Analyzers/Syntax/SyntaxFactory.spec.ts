import { describe } from 'vitest';
import { createSyntax } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Validation/Analyzers/Syntax/SyntaxFactory';
import { ScriptLanguage } from '@/domain/ScriptMetadata/ScriptLanguage';
import { ShellScriptSyntax } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Validation/Analyzers/Syntax/ShellScriptSyntax';
import { BatchFileSyntax } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Validation/Analyzers/Syntax/BatchFileSyntax';
import type { LanguageSyntax } from '@/application/Application/Loader/Collections/Compiler/Executable/Script/Validation/Analyzers/Syntax/LanguageSyntax';
import type { Constructible } from '@/TypeHelpers';

describe('SyntaxFactory', () => {
  describe('createSyntax', () => {
    it('throws given invalid language', () => {
      // arrange
      const invalidLanguage = 5 as ScriptLanguage;
      const expectedErrorMessage = `Invalid language: "${ScriptLanguage[invalidLanguage]}"`;
      // act
      const act = () => createSyntax(invalidLanguage);
      // assert
      expect(act).to.throw(expectedErrorMessage);
    });
    describe('creates syntax for supported languages', () => {
      const languageTestScenarios: Record<ScriptLanguage, Constructible<LanguageSyntax>> = {
        [ScriptLanguage.batchfile]: BatchFileSyntax,
        [ScriptLanguage.shellscript]: ShellScriptSyntax,
      };
      Object.entries(languageTestScenarios).forEach(([key, value]) => {
        // arrange
        const scriptingLanguage = Number(key) as ScriptLanguage;
        const expectedType = value;
        it(`gets correct type for "${ScriptLanguage[scriptingLanguage]}" language`, () => {
          // act
          const syntax = createSyntax(scriptingLanguage);
          // assert
          expect(syntax).to.be.instanceOf(expectedType);
        });
      });
    });
  });
});
