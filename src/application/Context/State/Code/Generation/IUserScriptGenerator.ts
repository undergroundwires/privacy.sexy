import type { ScriptingDefinition } from '@/domain/ScriptingDefinition';
import type { SelectedScript } from '@/application/Context/State/Selection/Script/SelectedScript';
import type { IUserScript } from './IUserScript';

export interface IUserScriptGenerator {
  buildCode(
    selectedScripts: ReadonlyArray<SelectedScript>,
    scriptingDefinition: ScriptingDefinition,
  ): IUserScript;
}
