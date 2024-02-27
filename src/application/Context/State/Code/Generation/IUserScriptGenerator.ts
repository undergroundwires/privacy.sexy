import type { IScriptingDefinition } from '@/domain/IScriptingDefinition';
import type { SelectedScript } from '@/application/Context/State/Selection/Script/SelectedScript';
import type { IUserScript } from './IUserScript';

export interface IUserScriptGenerator {
  buildCode(
    selectedScripts: ReadonlyArray<SelectedScript>,
    scriptingDefinition: IScriptingDefinition,
  ): IUserScript;
}
