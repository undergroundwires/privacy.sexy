import { IUserFilter } from './Filter/IUserFilter';
import { IUserSelection } from './Selection/IUserSelection';
import { IApplicationCode } from './Code/IApplicationCode';
export { IUserSelection, IApplicationCode, IUserFilter };

export interface ICategoryCollectionState {
    readonly code: IApplicationCode;
    readonly filter: IUserFilter;
    readonly selection: IUserSelection;
}
