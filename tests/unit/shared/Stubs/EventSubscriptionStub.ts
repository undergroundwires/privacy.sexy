import { IEventSubscription } from '@/infrastructure/Events/IEventSource';

export class EventSubscriptionStub implements IEventSubscription {
  private currentState = SubscriptionState.Subscribed;

  public get isUnsubscribed(): boolean {
    return this.currentState === SubscriptionState.Unsubscribed;
  }

  public get isSubscribed(): boolean {
    return this.currentState === SubscriptionState.Subscribed;
  }

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
    this.currentState = SubscriptionState.Unsubscribed;
  }
}

type UnsubscribeCallback = () => void;

enum SubscriptionState {
  Subscribed,
  Unsubscribed,
}
