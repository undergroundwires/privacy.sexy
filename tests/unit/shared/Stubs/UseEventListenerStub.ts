import type {
  EventTargetSource,
  TargetEventListener,
  UseEventListener,
} from '@/presentation/components/Shared/Hooks/UseAutoUnsubscribedEventListener';

export class UseEventListenerStub {
  public get(): UseEventListener {
    return () => createEventListenerStub();
  }
}

function createEventListenerStub(): TargetEventListener {
  function listen<TEvent extends keyof HTMLElementEventMap>(
    targetElementSource: EventTargetSource<HTMLElement>,
    eventType: TEvent,
    eventResponseFunction: (event: HTMLElementEventMap[TEvent]) => void,
  ): void;
  function listen<TEvent extends keyof WindowEventMap>(
    targetElementSource: EventTargetSource<Window>,
    eventType: TEvent,
    eventResponseFunction: (event: WindowEventMap[TEvent]) => void,
  ): void;
  function listen<TEvent extends keyof DocumentEventMap>(
    targetElementSource: EventTargetSource<Document>,
    eventType: TEvent,
    eventResponseFunction: (event: DocumentEventMap[TEvent]) => void,
  ): void;
  function listen(
    targetElementSource: EventTargetSource<EventTarget>,
    eventType: string,
    eventResponseFunction: (event: Event) => void,
  ): void {
    const targetElement = targetElementSource instanceof EventTarget
      ? targetElementSource
      : targetElementSource.value;
    targetElement?.addEventListener(eventType, eventResponseFunction);
  }
  return { startListening: listen };
}
