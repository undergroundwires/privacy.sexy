import { IEventSource } from '@/infrastructure/Events/IEventSource';
import { ICodeChangedEvent } from './Event/ICodeChangedEvent';

export interface IApplicationCode {
  readonly changed: IEventSource<ICodeChangedEvent>;
  readonly current: string;
}
