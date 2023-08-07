import { IEventSubscription } from '@/infrastructure/Events/IEventSource';

type UnsubscribeCallback = () => void;

export class EventSubscriptionStub implements IEventSubscription {
  private readonly onUnsubscribe = new Array<UnsubscribeCallback>();

  constructor(unsubscribeCallback?: UnsubscribeCallback) {
    if (unsubscribeCallback) {
      this.onUnsubscribe.push(unsubscribeCallback);
    }
  }

  unsubscribe(): void {
    for (const callback of this.onUnsubscribe) {
      callback();
    }
  }
}
