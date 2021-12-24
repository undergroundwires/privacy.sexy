import { ICategoryCollectionState, IReadOnlyCategoryCollectionState } from './State/ICategoryCollectionState';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { IEventSource } from '@/infrastructure/Events/IEventSource';
import { IApplication } from '@/domain/IApplication';

export interface IReadOnlyApplicationContext {
    readonly app: IApplication;
    readonly state: IReadOnlyCategoryCollectionState;
    readonly contextChanged: IEventSource<IApplicationContextChangedEvent>;
}

export interface IApplicationContext extends IReadOnlyApplicationContext {
    readonly state: ICategoryCollectionState;
    changeContext(os: OperatingSystem): void;
}

export interface IApplicationContextChangedEvent {
    readonly newState: ICategoryCollectionState;
    readonly oldState: ICategoryCollectionState;
}
