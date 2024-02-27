import type { ScriptData } from '@/application/collections/';
import type { IScriptCode } from '@/domain/IScriptCode';

export interface IScriptCompiler {
  canCompile(script: ScriptData): boolean;
  compile(script: ScriptData): IScriptCode;
}
