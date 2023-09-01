import { onUnmounted } from 'vue';
import { EventSubscriptionCollection } from '@/infrastructure/Events/EventSubscriptionCollection';
import { IEventSubscriptionCollection } from '@/infrastructure/Events/IEventSubscriptionCollection';

export function useAutoUnsubscribedEvents(
  events: IEventSubscriptionCollection = new EventSubscriptionCollection(),
) {
  if (events.subscriptionCount > 0) {
    throw new Error('there are existing subscriptions, this may lead to side-effects');
  }

  onUnmounted(() => {
    events.unsubscribeAll();
  });

  return {
    events,
  };
}
