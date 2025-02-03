import type { ScriptMetadata } from '@/domain/ScriptMetadata/ScriptMetadata';
import type { SelectedScript } from '@/application/Context/State/Selection/Script/SelectedScript';
import type { IUserScript } from './IUserScript';

export interface IUserScriptGenerator {
  buildCode(
    selectedScripts: ReadonlyArray<SelectedScript>,
    scriptMetadata: ScriptMetadata,
  ): IUserScript;
}
