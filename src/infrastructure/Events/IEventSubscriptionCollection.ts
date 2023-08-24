import { IEventSubscription } from '@/infrastructure/Events/IEventSource';

export interface IEventSubscriptionCollection {
  register(...subscriptions: IEventSubscription[]);

  unsubscribeAll();
}
