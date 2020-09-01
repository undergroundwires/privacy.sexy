import { SelectedScript } from '@/application/State/Selection/SelectedScript';
import { IUserSelection } from '@/application/State/IApplicationState';

export interface IReverter {
    getState(selectedScripts: ReadonlyArray<SelectedScript>): boolean;
    selectWithRevertState(newState: boolean, selection: IUserSelection): void;
}
