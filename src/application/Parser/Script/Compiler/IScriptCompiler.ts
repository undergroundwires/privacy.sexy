import { ScriptData } from 'js-yaml-loader!@/*';
import { IScriptCode } from '@/domain/IScriptCode';

export interface IScriptCompiler {
  canCompile(script: ScriptData): boolean;
  compile(script: ScriptData): IScriptCode;
}
