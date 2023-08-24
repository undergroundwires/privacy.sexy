import { IEventSubscription } from './IEventSource';
import { IEventSubscriptionCollection } from './IEventSubscriptionCollection';

export class EventSubscriptionCollection implements IEventSubscriptionCollection {
  private readonly subscriptions = new Array<IEventSubscription>();

  public register(...subscriptions: IEventSubscription[]) {
    this.subscriptions.push(...subscriptions);
  }

  public unsubscribeAll() {
    this.subscriptions.forEach((listener) => listener.unsubscribe());
    this.subscriptions.splice(0, this.subscriptions.length);
  }
}
