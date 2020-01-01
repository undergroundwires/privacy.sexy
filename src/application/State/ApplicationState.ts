import { UserFilter } from './Filter/UserFilter';
import { IUserFilter } from './Filter/IUserFilter';
import { ApplicationCode } from './Code/ApplicationCode';
import { UserSelection } from './Selection/UserSelection';
import { IUserSelection } from './Selection/IUserSelection';
import { AsyncLazy } from '../../infrastructure/Threading/AsyncLazy';
import { Signal } from '../../infrastructure/Events/Signal';
import { ICategory } from '../../domain/ICategory';
import { ApplicationParser } from '../ApplicationParser';
import { IApplicationState } from './IApplicationState';
import { Script } from '../../domain/Script';
import { Application } from '../../domain/Application';
import { IApplicationCode } from './Code/IApplicationCode';

/** Mutatable singleton application state that's the single source of truth throughout the application */
export class ApplicationState implements IApplicationState {
    /** Get singleton application state */
    public static GetAsync(): Promise<IApplicationState> {
        return ApplicationState.instance.getValueAsync();
    }

    /** Application instance with all scripts. */
    private static instance = new AsyncLazy<IApplicationState>(() => {
        const app = ApplicationParser.buildApplication();
        const state = new ApplicationState(app.application, app.selectedScripts);
        return Promise.resolve(state);
    });

    public readonly code: IApplicationCode;
    public readonly stateChanged = new Signal<IApplicationState>();
    public readonly selection: IUserSelection;
    public readonly filter: IUserFilter;

    private constructor(
        /** Inner instance of the all scripts */
        private readonly app: Application,
        /** Initially selected scripts */
        public readonly defaultScripts: Script[]) {
        this.selection = new UserSelection(app, defaultScripts);
        this.code = new ApplicationCode(this.selection, app.version.toString());
        this.filter = new UserFilter(app);
    }

    public getCategory(categoryId: number): ICategory | undefined {
        return this.app.findCategory(categoryId);
    }

    public get categories(): ReadonlyArray<ICategory> {
        return this.app.categories;
    }

    public get appName(): string {
        return this.app.name;
    }

    public get appVersion(): number {
        return this.app.version;
    }

    public get appTotalScripts(): number {
        return this.app.totalScripts;
    }
}

export { IApplicationState, IUserFilter };
