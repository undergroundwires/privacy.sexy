import { IEventSubscription } from '@/infrastructure/Events/IEventSource';

export interface IEventSubscriptionCollection {
  readonly subscriptionCount: number;

  register(subscriptions: IEventSubscription[]): void;
  unsubscribeAll(): void;
  unsubscribeAllAndRegister(subscriptions: IEventSubscription[]): void;
}
