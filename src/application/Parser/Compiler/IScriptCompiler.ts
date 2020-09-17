import { IScriptCode } from '@/domain/IScriptCode';
import { YamlScript } from 'js-yaml-loader!./application.yaml';

export interface IScriptCompiler {
    canCompile(script: YamlScript): boolean;
    compile(script: YamlScript): IScriptCode;
}
