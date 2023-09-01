import { IEventSubscriptionCollection } from './IEventSubscriptionCollection';
import { IEventSubscription } from './IEventSource';

export class EventSubscriptionCollection implements IEventSubscriptionCollection {
  private readonly subscriptions = new Array<IEventSubscription>();

  public get subscriptionCount() {
    return this.subscriptions.length;
  }

  public register(subscriptions: IEventSubscription[]) {
    if (!subscriptions || subscriptions.length === 0) {
      throw new Error('missing subscriptions');
    }
    if (subscriptions.some((subscription) => !subscription)) {
      throw new Error('missing subscription in list');
    }
    this.subscriptions.push(...subscriptions);
  }

  public unsubscribeAll() {
    this.subscriptions.forEach((listener) => listener.unsubscribe());
    this.subscriptions.splice(0, this.subscriptions.length);
  }

  public unsubscribeAllAndRegister(subscriptions: IEventSubscription[]) {
    this.unsubscribeAll();
    this.register(subscriptions);
  }
}
