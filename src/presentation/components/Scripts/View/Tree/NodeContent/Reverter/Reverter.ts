import { UserSelection } from '@/application/Context/State/Selection/UserSelection';
import { SelectedScript } from '@/application/Context/State/Selection/Script/SelectedScript';

export interface Reverter {
  getState(selectedScripts: ReadonlyArray<SelectedScript>): boolean;
  selectWithRevertState(newState: boolean, selection: UserSelection): void;
}
