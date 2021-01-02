import { SelectedScript } from '@/application/Context/State/Selection/SelectedScript';
import { IUserSelection } from '@/application/Context/State/ICategoryCollectionState';

export interface IReverter {
    getState(selectedScripts: ReadonlyArray<SelectedScript>): boolean;
    selectWithRevertState(newState: boolean, selection: IUserSelection): void;
}
