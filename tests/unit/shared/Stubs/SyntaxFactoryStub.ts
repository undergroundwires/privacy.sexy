import type { ILanguageSyntax } from '@/application/Parser/Executable/Script/Validation/Syntax/ILanguageSyntax';
import type { ISyntaxFactory } from '@/application/Parser/Executable/Script/Validation/Syntax/ISyntaxFactory';
import type { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { LanguageSyntaxStub } from './LanguageSyntaxStub';

export function createSyntaxFactoryStub(
  expectedLanguage?: ScriptingLanguage,
  result?: ILanguageSyntax,
): ISyntaxFactory {
  return {
    create: (language: ScriptingLanguage) => {
      if (expectedLanguage !== undefined && language !== expectedLanguage) {
        throw new Error('unexpected language');
      }
      return result ?? new LanguageSyntaxStub();
    },
  };
}
