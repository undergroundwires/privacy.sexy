import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import type { LanguageSyntax } from '@/application/Parser/Executable/Script/Validation/Analyzers/Syntax/LanguageSyntax';
import { BatchFileSyntax } from './BatchFileSyntax';
import { ShellScriptSyntax } from './ShellScriptSyntax';

export interface SyntaxFactory {
  (language: ScriptingLanguage): LanguageSyntax;
}

export const createSyntax: SyntaxFactory = (language: ScriptingLanguage): LanguageSyntax => {
  switch (language) {
    case ScriptingLanguage.batchfile:
      return new BatchFileSyntax();
    case ScriptingLanguage.shellscript:
      return new ShellScriptSyntax();
    default:
      throw new RangeError(`Invalid language: "${ScriptingLanguage[language]}"`);
  }
};
