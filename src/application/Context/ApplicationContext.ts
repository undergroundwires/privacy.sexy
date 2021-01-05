import { IApplicationContext, IApplicationContextChangedEvent } from './IApplicationContext';
import { ICategoryCollectionState } from './State/ICategoryCollectionState';
import { CategoryCollectionState } from './State/CategoryCollectionState';
import { IApplication } from '@/domain/IApplication';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { ICategoryCollection } from '@/domain/ICategoryCollection';
import { Signal } from '@/infrastructure/Events/Signal';

type StateMachine = Map<OperatingSystem, ICategoryCollectionState>;

export class ApplicationContext implements IApplicationContext {
    public readonly contextChanged = new Signal<IApplicationContextChangedEvent>();
    public collection: ICategoryCollection;
    public currentOs: OperatingSystem;

    public get state(): ICategoryCollectionState {
        return this.states[this.collection.os];
    }

    private readonly states: StateMachine;
    public constructor(
        public readonly app: IApplication,
        initialContext: OperatingSystem) {
        validateApp(app);
        validateOs(initialContext);
        this.states = initializeStates(app);
        this.changeContext(initialContext);
    }

    public changeContext(os: OperatingSystem): void {
        if (this.currentOs === os) {
            return;
        }
        this.collection = this.app.getCollection(os);
        if (!this.collection) {
            throw new Error(`os "${OperatingSystem[os]}" is not defined in application`);
        }
        const event: IApplicationContextChangedEvent = {
            newState: this.state,
            newCollection: this.collection,
            newOs: os,
        };
        this.contextChanged.notify(event);
        this.currentOs = os;
    }
}

function validateApp(app: IApplication) {
    if (!app) {
        throw new Error('undefined app');
    }
}

function validateOs(os: OperatingSystem) {
    if (os === undefined) {
        throw new Error('undefined os');
    }
    if (os === OperatingSystem.Unknown) {
        throw new Error('unknown os');
    }
    if (!(os in OperatingSystem)) {
        throw new Error(`os "${os}" is out of range`);
    }
}

function initializeStates(app: IApplication): StateMachine {
    const machine = new Map<OperatingSystem, ICategoryCollectionState>();
    for (const collection of app.collections) {
        machine[collection.os] = new CategoryCollectionState(collection);
    }
    return machine;
}
