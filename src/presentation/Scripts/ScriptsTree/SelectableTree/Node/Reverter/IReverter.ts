import { SelectedScript } from '@/application/Context/State/Selection/SelectedScript';
import { IUserSelection } from '@/application/Context/State/IApplicationState';

export interface IReverter {
    getState(selectedScripts: ReadonlyArray<SelectedScript>): boolean;
    selectWithRevertState(newState: boolean, selection: IUserSelection): void;
}
