import { ILanguageSyntax } from '@/domain/ScriptCode';
import { IScriptingLanguageFactory } from '@/application/Common/ScriptingLanguage/IScriptingLanguageFactory';

export interface ISyntaxFactory extends IScriptingLanguageFactory<ILanguageSyntax> {
}
