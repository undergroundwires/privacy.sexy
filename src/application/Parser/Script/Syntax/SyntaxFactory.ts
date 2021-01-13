import { ILanguageSyntax } from '@/domain/ScriptCode';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { ISyntaxFactory } from './ISyntaxFactory';
import { BatchFileSyntax } from './BatchFileSyntax';
import { ShellScriptSyntax } from './ShellScriptSyntax';

export class SyntaxFactory implements ISyntaxFactory {
    public create(language: ScriptingLanguage): ILanguageSyntax {
        switch (language) {
            case ScriptingLanguage.batchfile:   return new BatchFileSyntax();
            case ScriptingLanguage.shellscript: return new ShellScriptSyntax();
            default:    throw new RangeError(`unknown language: "${ScriptingLanguage[language]}"`);
        }
    }
}
