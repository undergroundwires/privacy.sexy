import { IEventSubscription } from './ISubscription';
export interface ISignal<T> {
    on(handler: EventHandler<T>): IEventSubscription;
}

export type EventHandler<T> = (data: T) => void;
