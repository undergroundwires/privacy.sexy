import { useAutoUnsubscribedEvents } from '@/presentation/components/Shared/Hooks/UseAutoUnsubscribedEvents';
import { EventSubscriptionCollectionStub } from './EventSubscriptionCollectionStub';

export class UseAutoUnsubscribedEventsStub {
  public get(): ReturnType<typeof useAutoUnsubscribedEvents> {
    return {
      events: new EventSubscriptionCollectionStub(),
    };
  }
}
