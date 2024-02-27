import { OperatingSystem } from '@/domain/OperatingSystem';
import type { IEventSource } from '@/infrastructure/Events/IEventSource';
import type { IApplication } from '@/domain/IApplication';
import type { ICategoryCollectionState, IReadOnlyCategoryCollectionState } from './State/ICategoryCollectionState';

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
