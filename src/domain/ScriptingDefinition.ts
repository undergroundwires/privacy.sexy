import { ScriptingLanguage } from './ScriptingLanguage';

export interface ScriptingDefinition {
  readonly fileExtension: string;
  readonly language: ScriptingLanguage;
  readonly startCode: string;
  readonly endCode: string;
}
