import { ScriptLanguage } from '@/domain/ScriptMetadata/ScriptLanguage';
import type { LanguageSyntax } from '@/application/Parser/Executable/Script/Validation/Analyzers/Syntax/LanguageSyntax';
import { BatchFileSyntax } from './BatchFileSyntax';
import { ShellScriptSyntax } from './ShellScriptSyntax';

export interface SyntaxFactory {
  (language: ScriptLanguage): LanguageSyntax;
}

export const createSyntax: SyntaxFactory = (language: ScriptLanguage): LanguageSyntax => {
  switch (language) {
    case ScriptLanguage.batchfile:
      return new BatchFileSyntax();
    case ScriptLanguage.shellscript:
      return new ShellScriptSyntax();
    default:
      throw new RangeError(`Invalid language: "${ScriptLanguage[language]}"`);
  }
};
