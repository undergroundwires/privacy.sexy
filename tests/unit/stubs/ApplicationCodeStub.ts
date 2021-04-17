import { ICodeChangedEvent } from '@/application/Context/State/Code/Event/ICodeChangedEvent';
import { IApplicationCode } from '@/application/Context/State/Code/IApplicationCode';
import { IEventSource } from '@/infrastructure/Events/IEventSource';
import { EventSource } from '@/infrastructure/Events/EventSource';

export class ApplicationCodeStub implements IApplicationCode {
    public changed: IEventSource<ICodeChangedEvent> = new EventSource<ICodeChangedEvent>();
    public current: string = '';
}
