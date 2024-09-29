import { describe } from 'vitest';
import { createSyntax } from '@/application/Parser/Executable/Script/Validation/Analyzers/Syntax/SyntaxFactory';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { ShellScriptSyntax } from '@/application/Parser/Executable/Script/Validation/Analyzers/Syntax/ShellScriptSyntax';
import { BatchFileSyntax } from '@/application/Parser/Executable/Script/Validation/Analyzers/Syntax/BatchFileSyntax';
import type { LanguageSyntax } from '@/application/Parser/Executable/Script/Validation/Analyzers/Syntax/LanguageSyntax';
import type { Constructible } from '@/TypeHelpers';

describe('SyntaxFactory', () => {
  describe('createSyntax', () => {
    it('throws given invalid language', () => {
      // arrange
      const invalidLanguage = 5 as ScriptingLanguage;
      const expectedErrorMessage = `Invalid language: "${ScriptingLanguage[invalidLanguage]}"`;
      // act
      const act = () => createSyntax(invalidLanguage);
      // assert
      expect(act).to.throw(expectedErrorMessage);
    });
    describe('creates syntax for supported languages', () => {
      const languageTestScenarios: Record<ScriptingLanguage, Constructible<LanguageSyntax>> = {
        [ScriptingLanguage.batchfile]: BatchFileSyntax,
        [ScriptingLanguage.shellscript]: ShellScriptSyntax,
      };
      Object.entries(languageTestScenarios).forEach(([key, value]) => {
        // arrange
        const scriptingLanguage = Number(key) as ScriptingLanguage;
        const expectedType = value;
        it(`gets correct type for "${ScriptingLanguage[scriptingLanguage]}" language`, () => {
          // act
          const syntax = createSyntax(scriptingLanguage);
          // assert
          expect(syntax).to.be.instanceOf(expectedType);
        });
      });
    });
  });
});
