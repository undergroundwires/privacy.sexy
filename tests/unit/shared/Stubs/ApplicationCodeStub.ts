import { ICodeChangedEvent } from '@/application/Context/State/Code/Event/ICodeChangedEvent';
import { IApplicationCode } from '@/application/Context/State/Code/IApplicationCode';
import { EventSourceStub } from './EventSourceStub';

export class ApplicationCodeStub implements IApplicationCode {
  public changed = new EventSourceStub<ICodeChangedEvent>();

  public current = '';

  public triggerCodeChange(event: ICodeChangedEvent): this {
    this.changed.notify(event);
    return this;
  }

  public withCurrentCode(currentCode: string): this {
    this.current = currentCode;
    return this;
  }
}
