import type { IScriptingLanguageFactory } from '@/application/Common/ScriptingLanguage/IScriptingLanguageFactory';
import type { ILanguageSyntax } from './ILanguageSyntax';

export type ISyntaxFactory = IScriptingLanguageFactory<ILanguageSyntax>;
