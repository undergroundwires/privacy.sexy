import { IApplication } from './../../domain/IApplication';
import { IUserFilter } from './Filter/IUserFilter';
import { IUserSelection } from './Selection/IUserSelection';
import { ISignal } from '@/infrastructure/Events/ISignal';
import { ICategory, IScript } from '@/domain/ICategory';
import { IApplicationCode } from './Code/IApplicationCode';
export { IUserSelection, IApplicationCode, IUserFilter };

export interface IApplicationState {
    /** Event that fires when the application states changes with new application state as parameter */
    readonly code: IApplicationCode;
    readonly filter: IUserFilter;
    readonly stateChanged: ISignal<IApplicationState>;
    readonly selection: IUserSelection;
    readonly app: IApplication;
}
