import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { ICodeBuilder } from './ICodeBuilder';

export interface ICodeBuilderFactory {
    create(language: ScriptingLanguage): ICodeBuilder;
}
