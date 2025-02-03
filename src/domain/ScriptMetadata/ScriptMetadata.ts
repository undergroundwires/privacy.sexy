import { ScriptLanguage } from './ScriptLanguage';

export interface ScriptMetadata {
  readonly fileExtension: string;
  readonly language: ScriptLanguage;
  readonly startCode: string;
  readonly endCode: string;
}
