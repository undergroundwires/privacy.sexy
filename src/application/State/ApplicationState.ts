import { UserFilter } from './Filter/UserFilter';
import { IUserFilter } from './Filter/IUserFilter';
import { ApplicationCode } from './Code/ApplicationCode';
import { UserSelection } from './Selection/UserSelection';
import { IUserSelection } from './Selection/IUserSelection';
import { AsyncLazy } from '@/infrastructure/Threading/AsyncLazy';
import { Signal } from '@/infrastructure/Events/Signal';
import { parseApplication } from '../Parser/ApplicationParser';
import { IApplicationState } from './IApplicationState';
import { Script } from '@/domain/Script';
import { IApplication } from '@/domain/IApplication';
import { IApplicationCode } from './Code/IApplicationCode';
import applicationFile from 'js-yaml-loader!@/application/application.yaml';
import { SelectedScript } from '@/application/State/Selection/SelectedScript';

/** Mutatable singleton application state that's the single source of truth throughout the application */
export class ApplicationState implements IApplicationState {
    /** Get singleton application state */
    public static GetAsync(): Promise<IApplicationState> {
        return ApplicationState.instance.getValueAsync();
    }

    /** Application instance with all scripts. */
    private static instance = new AsyncLazy<IApplicationState>(() => {
        const application = parseApplication(applicationFile);
        const selectedScripts = new Array<Script>();
        const state = new ApplicationState(application, selectedScripts);
        return Promise.resolve(state);
    });

    public readonly code: IApplicationCode;
    public readonly stateChanged = new Signal<IApplicationState>();
    public readonly selection: IUserSelection;
    public readonly filter: IUserFilter;

    private constructor(
        /** Inner instance of the all scripts */
        public readonly app: IApplication,
        /** Initially selected scripts */
        public readonly defaultScripts: Script[]) {
        this.selection = new UserSelection(app, defaultScripts.map((script) => new SelectedScript(script, false)));
        this.code = new ApplicationCode(this.selection, app.info.version);
        this.filter = new UserFilter(app);
    }
}
