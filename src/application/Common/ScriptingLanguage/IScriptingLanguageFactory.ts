import { ScriptingLanguage } from '@/domain/ScriptingLanguage';

export interface IScriptingLanguageFactory<T> {
  create(language: ScriptingLanguage): T;
}
