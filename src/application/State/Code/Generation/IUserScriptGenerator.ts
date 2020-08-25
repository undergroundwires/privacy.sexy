import { SelectedScript } from '@/application/State/Selection/SelectedScript';

export interface IUserScriptGenerator {
    buildCode(selectedScripts: ReadonlyArray<SelectedScript>, version: string): string;
}
