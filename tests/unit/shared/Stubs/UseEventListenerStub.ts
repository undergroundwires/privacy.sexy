import type { UseEventListener } from '@/presentation/components/Shared/Hooks/UseAutoUnsubscribedEventListener';

export class UseEventListenerStub {
  public get(): UseEventListener {
    return () => ({
      startListening: (targetElementSource, eventType, eventResponseFunction) => {
        if (targetElementSource instanceof EventTarget) {
          targetElementSource.addEventListener(eventType, eventResponseFunction);
          return;
        }
        targetElementSource.value?.addEventListener(eventType, eventResponseFunction);
      },
    });
  }
}
