import { IScriptingLanguageFactory } from '@/application/Common/ScriptingLanguage/IScriptingLanguageFactory';
import { ILanguageSyntax } from './ILanguageSyntax';

export type ISyntaxFactory = IScriptingLanguageFactory<ILanguageSyntax>;
