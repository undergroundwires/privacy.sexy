import {
  onBeforeUnmount,
  shallowRef,
  watch,
  type Ref,
} from 'vue';

export interface UseEventListener {
  (): TargetEventListener;
}

export const useAutoUnsubscribedEventListener: UseEventListener = () => ({
  startListening: (eventTargetSource, eventType, eventHandler) => {
    const eventTargetRef = isEventTarget(eventTargetSource)
      ? shallowRef(eventTargetSource)
      : eventTargetSource;
    return startListeningRef(
      eventTargetRef,
      eventType,
      eventHandler,
    );
  },
});

type EventTargetRef = Readonly<Ref<EventTarget | undefined>>;

type EventTargetOrRef = EventTargetRef | EventTarget;

function isEventTarget(obj: EventTargetOrRef): obj is EventTarget {
  return obj instanceof EventTarget;
}

export interface TargetEventListener {
  startListening<TEvent extends keyof HTMLElementEventMap>(
    eventTargetSource: EventTargetOrRef,
    eventType: TEvent,
    eventHandler: (event: HTMLElementEventMap[TEvent]) => void,
  ): void;
}

function startListeningRef<TEvent extends keyof HTMLElementEventMap>(
  eventTargetRef: Readonly<Ref<EventTarget | undefined>>,
  eventType: TEvent,
  eventHandler: (event: HTMLElementEventMap[TEvent]) => void,
): void {
  const eventListenerManager = new EventListenerManager();
  watch(() => eventTargetRef.value, (element) => {
    eventListenerManager.removeListenerIfExists();
    if (!element) {
      return;
    }
    eventListenerManager.addListener(element, eventType, eventHandler);
  }, { immediate: true });

  onBeforeUnmount(() => {
    eventListenerManager.removeListenerIfExists();
  });
}

class EventListenerManager {
  private removeListener: (() => void) | null = null;

  public removeListenerIfExists() {
    if (this.removeListener === null) {
      return;
    }
    this.removeListener();
    this.removeListener = null;
  }

  public addListener<TEvent extends keyof HTMLElementEventMap>(
    eventTarget: EventTarget,
    eventType: TEvent,
    eventHandler: (event: HTMLElementEventMap[TEvent]) => void,
  ) {
    eventTarget.addEventListener(eventType, eventHandler);
    this.removeListener = () => eventTarget.removeEventListener(eventType, eventHandler);
  }
}
