import { onUnmounted } from 'vue';
import { EventSubscriptionCollection } from '@/infrastructure/Events/EventSubscriptionCollection';
import type { IEventSubscriptionCollection } from '@/infrastructure/Events/IEventSubscriptionCollection';
import type { LifecycleHook } from './Common/LifecycleHook';

export function useAutoUnsubscribedEvents(
  events: IEventSubscriptionCollection = new EventSubscriptionCollection(),
  onTeardown: LifecycleHook = onUnmounted,
) {
  if (events.subscriptionCount > 0) {
    throw new Error('there are existing subscriptions, this may lead to side-effects');
  }

  onTeardown(() => {
    events.unsubscribeAll();
  });

  return {
    events,
  };
}
