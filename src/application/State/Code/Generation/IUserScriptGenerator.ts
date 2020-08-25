import { SelectedScript } from '@/application/State/Selection/SelectedScript';
import { IUserScript } from './IUserScript';
export interface IUserScriptGenerator {
    buildCode(
        selectedScripts: ReadonlyArray<SelectedScript>,
        version: string): IUserScript;
}
