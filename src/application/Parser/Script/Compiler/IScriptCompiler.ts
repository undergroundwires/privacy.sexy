import type { ScriptData } from '@/application/collections/';
import type { ScriptCode } from '@/domain/Executables/Script/Code/ScriptCode';

export interface IScriptCompiler {
  canCompile(script: ScriptData): boolean;
  compile(script: ScriptData): ScriptCode;
}
