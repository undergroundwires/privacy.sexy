import { ICategoryCollectionState } from './State/ICategoryCollectionState';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { IEventSource } from '@/infrastructure/Events/IEventSource';
import { IApplication } from '@/domain/IApplication';

export interface IApplicationContext {
    readonly app: IApplication;
    readonly state: ICategoryCollectionState;
    readonly contextChanged: IEventSource<IApplicationContextChangedEvent>;
    changeContext(os: OperatingSystem): void;
}

export interface IApplicationContextChangedEvent {
    readonly newState: ICategoryCollectionState;
    readonly oldState: ICategoryCollectionState;
}
