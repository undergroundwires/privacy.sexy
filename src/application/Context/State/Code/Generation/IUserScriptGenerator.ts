import { SelectedScript } from '@/application/Context/State/Selection/SelectedScript';
import { IScriptingDefinition } from '@/domain/IScriptingDefinition';
import { IUserScript } from './IUserScript';

export interface IUserScriptGenerator {
  buildCode(
    selectedScripts: ReadonlyArray<SelectedScript>,
    scriptingDefinition: IScriptingDefinition): IUserScript;
}
