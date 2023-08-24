import { IEventSubscription } from '@/infrastructure/Events/IEventSource';
import { IEventSubscriptionCollection } from '@/infrastructure/Events/IEventSubscriptionCollection';

export class EventSubscriptionCollectionStub implements IEventSubscriptionCollection {
  private readonly subscriptions = new Array<IEventSubscription>();

  public register(...subscriptions: IEventSubscription[]) {
    this.subscriptions.push(...subscriptions);
  }

  public unsubscribeAll() {
    this.subscriptions.length = 0;
  }
}
