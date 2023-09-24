import { useAutoUnsubscribedEvents } from '@/presentation/components/Shared/Hooks/UseAutoUnsubscribedEvents';
import { EventSubscriptionCollectionStub } from './EventSubscriptionCollectionStub';

export class UseAutoUnsubscribedEventsStub {
  public readonly events = new EventSubscriptionCollectionStub();

  public get(): ReturnType<typeof useAutoUnsubscribedEvents> {
    return {
      events: this.events,
    };
  }
}
