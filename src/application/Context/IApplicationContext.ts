import { ICategoryCollectionState } from './State/ICategoryCollectionState';
import { ICategoryCollection } from '@/domain/ICategoryCollection';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { ISignal } from '@/infrastructure/Events/ISignal';
import { IApplication } from '@/domain/IApplication';

export interface IApplicationContext {
    readonly currentOs: OperatingSystem;
    readonly app: IApplication;
    readonly collection: ICategoryCollection;
    readonly state: ICategoryCollectionState;
    readonly contextChanged: ISignal<IApplicationContextChangedEvent>;
    changeContext(os: OperatingSystem): void;
}

export interface IApplicationContextChangedEvent {
    readonly newState: ICategoryCollectionState;
    readonly newCollection: ICategoryCollection;
    readonly newOs: OperatingSystem;
}
