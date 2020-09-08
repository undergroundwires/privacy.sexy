import { SelectedScript } from '@/application/State/Selection/SelectedScript';
import { IUserScript } from './IUserScript';
import { IScriptingDefinition } from '@/domain/IScriptingDefinition';

export interface IUserScriptGenerator {
    buildCode(
        selectedScripts: ReadonlyArray<SelectedScript>,
        scriptingDefinition: IScriptingDefinition): IUserScript;
}
