import { ILanguageSyntax } from '@/domain/ScriptCode';
import { IScriptingLanguageFactory } from '@/application/Common/ScriptingLanguage/IScriptingLanguageFactory';

export type ISyntaxFactory = IScriptingLanguageFactory<ILanguageSyntax>;
