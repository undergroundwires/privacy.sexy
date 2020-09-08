import { IApplicationContext } from './IApplicationContext';
import { IApplication } from '@/domain/IApplication';
import { IApplicationState } from './IApplicationState';
import { ApplicationState } from './ApplicationState';
import applicationFile from 'js-yaml-loader!@/application/application.yaml';
import { parseApplication } from '../Parser/ApplicationParser';


export function createContext(): IApplicationContext {
    const application = parseApplication(applicationFile);
    const context = new ApplicationContext(application);
    return context;
}

export class ApplicationContext implements IApplicationContext {
    public readonly state: IApplicationState;
    public constructor(public readonly app: IApplication) {
        this.state = new ApplicationState(app);
    }
}
