import { EventHandler, ISignal } from './ISignal';
import { IEventSubscription } from './ISubscription';

export class Signal<T> implements ISignal<T> {
    private handlers = new Map<number, EventHandler<T>>();

    public on(handler: EventHandler<T>): IEventSubscription {
        const id = this.getUniqueEventHandlerId();
        this.handlers.set(id, handler);
        return {
            unsubscribe: () => this.handlers.delete(id),
        };
    }

    public notify(data: T) {
        for (const handler of Array.from(this.handlers.values())) {
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
