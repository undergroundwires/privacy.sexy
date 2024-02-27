import type { IEventSource } from '@/infrastructure/Events/IEventSource';
import type { ICodeChangedEvent } from './Event/ICodeChangedEvent';

export interface IApplicationCode {
  readonly changed: IEventSource<ICodeChangedEvent>;
  readonly current: string;
}
