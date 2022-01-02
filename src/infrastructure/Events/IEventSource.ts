export interface IEventSource<T> {
  on(handler: EventHandler<T>): IEventSubscription;
}

export interface IEventSubscription {
  unsubscribe(): void;
}

export type EventHandler<T> = (data: T) => void;
