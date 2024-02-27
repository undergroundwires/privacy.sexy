import type { IEventSubscription } from '@/infrastructure/Events/IEventSource';
import type { IEventSubscriptionCollection } from '@/infrastructure/Events/IEventSubscriptionCollection';
import { StubWithObservableMethodCalls } from './StubWithObservableMethodCalls';

export class EventSubscriptionCollectionStub
  extends StubWithObservableMethodCalls<IEventSubscriptionCollection>
  implements IEventSubscriptionCollection {
  private readonly subscriptions = new Array<IEventSubscription>();

  public get mostRecentSubscription(): IEventSubscription | undefined {
    if (this.subscriptions.length === 0) {
      return undefined;
    }
    return this.subscriptions[this.subscriptions.length - 1];
  }

  public get subscriptionCount(): number {
    return this.subscriptions.length;
  }

  public register(
    subscriptions: IEventSubscription[],
  ): void {
    this.registerMethodCall({
      methodName: 'register',
      args: [subscriptions],
    });
    this.subscriptions.push(...subscriptions);
  }

  public unsubscribeAll(): void {
    this.registerMethodCall({
      methodName: 'unsubscribeAll',
      args: [],
    });
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.subscriptions.length = 0;
  }

  public unsubscribeAllAndRegister(
    subscriptions: IEventSubscription[],
  ): void {
    this.registerMethodCall({
      methodName: 'unsubscribeAllAndRegister',
      args: [subscriptions],
    });
    // Not calling other methods to avoid registering method calls.
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.subscriptions.splice(0, this.subscriptions.length, ...subscriptions);
  }
}
