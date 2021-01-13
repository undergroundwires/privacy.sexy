import { ICategoryCollectionState } from './State/ICategoryCollectionState';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { ISignal } from '@/infrastructure/Events/ISignal';
import { IApplication } from '@/domain/IApplication';

export interface IApplicationContext {
    readonly app: IApplication;
    readonly state: ICategoryCollectionState;
    readonly contextChanged: ISignal<IApplicationContextChangedEvent>;
    changeContext(os: OperatingSystem): void;
}

export interface IApplicationContextChangedEvent {
    readonly newState: ICategoryCollectionState;
    readonly oldState: ICategoryCollectionState;
}
