import { UserFilter } from './Filter/UserFilter';
import { IUserFilter } from './Filter/IUserFilter';
import { ApplicationCode } from './Code/ApplicationCode';
import { UserSelection } from './Selection/UserSelection';
import { IUserSelection } from './Selection/IUserSelection';
import { IApplicationState } from './IApplicationState';
import { IApplication } from '@/domain/IApplication';
import { IApplicationCode } from './Code/IApplicationCode';

export class ApplicationState implements IApplicationState {
    public readonly code: IApplicationCode;
    public readonly selection: IUserSelection;
    public readonly filter: IUserFilter;

    public constructor(readonly app: IApplication) {
        this.selection = new UserSelection(app, []);
        this.code = new ApplicationCode(this.selection, app.scripting);
        this.filter = new UserFilter(app);
    }
}
