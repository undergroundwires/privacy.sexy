import type { UseEventListener } from '@/presentation/components/Shared/Hooks/UseAutoUnsubscribedEventListener';

export class UseEventListenerStub {
  public get(): UseEventListener {
    return () => ({
      startListening: (targetElementSource, eventType, eventResponseFunction) => {
        const listener = eventResponseFunction as EventListener;
        if (targetElementSource instanceof EventTarget) {
          targetElementSource.addEventListener(eventType, listener);
          return;
        }
        targetElementSource.value?.addEventListener(eventType, listener);
      },
    });
  }
}
