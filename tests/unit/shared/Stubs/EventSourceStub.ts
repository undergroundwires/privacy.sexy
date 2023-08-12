import { EventHandler, IEventSource, IEventSubscription } from '@/infrastructure/Events/IEventSource';
import { EventSubscriptionStub } from './EventSubscriptionStub';

export class EventSourceStub<T> implements IEventSource<T> {
  private readonly handlers = new Array<EventHandler<T>>();

  public on(handler: EventHandler<T>): IEventSubscription {
    this.handlers.push(handler);
    return new EventSubscriptionStub(() => {
      const index = this.handlers.indexOf(handler);
      if (index !== -1) {
        this.handlers.splice(index, 1);
      }
    });
  }

  public notify(data: T) {
    for (const handler of this.handlers) {
      handler(data);
    }
  }
}
