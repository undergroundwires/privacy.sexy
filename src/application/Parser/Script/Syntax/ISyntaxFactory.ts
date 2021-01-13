import { ILanguageSyntax } from '@/domain/ScriptCode';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';

export interface ISyntaxFactory {
    create(language: ScriptingLanguage): ILanguageSyntax;
}
