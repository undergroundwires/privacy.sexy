import { IScriptingDefinition } from '@/domain/IScriptingDefinition';
import { SelectedScript } from '@/application/Context/State/Selection/Script/SelectedScript';
import { IUserScript } from './IUserScript';

export interface IUserScriptGenerator {
  buildCode(
    selectedScripts: ReadonlyArray<SelectedScript>,
    scriptingDefinition: IScriptingDefinition,
  ): IUserScript;
}
