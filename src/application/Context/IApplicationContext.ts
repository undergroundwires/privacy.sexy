import { OperatingSystem } from '@/domain/OperatingSystem';
import type { IEventSource } from '@/infrastructure/Events/IEventSource';
import type { Application } from '@/domain/Application';
import type { ICategoryCollectionState, IReadOnlyCategoryCollectionState } from './State/ICategoryCollectionState';

export interface IReadOnlyApplicationContext {
  readonly app: Application;
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
