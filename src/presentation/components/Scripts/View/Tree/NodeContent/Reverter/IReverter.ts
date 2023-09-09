import { IUserSelection } from '@/application/Context/State/Selection/IUserSelection';
import { SelectedScript } from '@/application/Context/State/Selection/SelectedScript';

export interface IReverter {
  getState(selectedScripts: ReadonlyArray<SelectedScript>): boolean;
  selectWithRevertState(newState: boolean, selection: IUserSelection): void;
}
