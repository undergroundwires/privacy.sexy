import { IScriptingLanguageFactory } from '@/application/Common/ScriptingLanguage/IScriptingLanguageFactory';
import { ICodeBuilder } from './ICodeBuilder';

export type ICodeBuilderFactory = IScriptingLanguageFactory<ICodeBuilder>;
