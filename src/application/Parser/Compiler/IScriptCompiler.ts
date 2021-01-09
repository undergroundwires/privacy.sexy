import { IScriptCode } from '@/domain/IScriptCode';
import { ScriptData } from 'js-yaml-loader!@/*';

export interface IScriptCompiler {
    canCompile(script: ScriptData): boolean;
    compile(script: ScriptData): IScriptCode;
}
