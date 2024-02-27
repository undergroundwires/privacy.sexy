import type { IScriptingLanguageFactory } from '@/application/Common/ScriptingLanguage/IScriptingLanguageFactory';
import type { ICodeBuilder } from './ICodeBuilder';

export type ICodeBuilderFactory = IScriptingLanguageFactory<ICodeBuilder>;
