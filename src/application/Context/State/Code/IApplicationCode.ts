import { ICodeChangedEvent } from './Event/ICodeChangedEvent';
import { IEventSource } from '@/infrastructure/Events/IEventSource';

export interface IApplicationCode {
    readonly changed: IEventSource<ICodeChangedEvent>;
    readonly current: string;
}
