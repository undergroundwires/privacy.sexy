import type { EventHandler, IEventSource, IEventSubscription } from './IEventSource';

export class EventSource<T> implements IEventSource<T> {
  private handlers = new Map<number, EventHandler<T>>();

  public on(handler: EventHandler<T>): IEventSubscription {
    const id = this.getUniqueEventHandlerId();
    this.handlers.set(id, handler);
    return {
      unsubscribe: () => this.handlers.delete(id),
    };
  }

  public notify(data: T) {
    for (const handler of this.handlers.values()) {
      handler(data);
    }
  }

  private getUniqueEventHandlerId(): number {
    const id = Math.random();
    if (this.handlers.has(id)) {
      return this.getUniqueEventHandlerId();
    }
    return id;
  }
}
