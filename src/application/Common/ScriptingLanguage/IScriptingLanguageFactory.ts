import { ScriptLanguage } from '@/domain/ScriptMetadata/ScriptLanguage';

export interface IScriptingLanguageFactory<T> {
  create(language: ScriptLanguage): T;
}
