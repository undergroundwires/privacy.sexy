import {
  onBeforeUnmount,
  shallowRef,
  watch,
  type Ref,
} from 'vue';
import type { LifecycleHook } from './Common/LifecycleHook';

export interface UseEventListener {
  (
    onTeardown?: LifecycleHook,
  ): TargetEventListener;
}

export const useAutoUnsubscribedEventListener: UseEventListener = (
  onTeardown = onBeforeUnmount,
) => ({
  startListening: (eventTargetSource, eventType, eventHandler) => {
    const eventTargetRef = isEventTarget(eventTargetSource)
      ? shallowRef(eventTargetSource)
      : eventTargetSource;
    return startListeningRef(
      eventTargetRef,
      eventType,
      eventHandler,
      onTeardown,
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
    eventHandler: TypedEventHandler<TEvent>,
  ): void;
}

function startListeningRef<TEvent extends keyof HTMLElementEventMap>(
  eventTargetRef: Readonly<Ref<EventTarget | undefined>>,
  eventType: TEvent,
  eventHandler: TypedEventHandler<TEvent>,
  onTeardown: LifecycleHook,
): void {
  const eventListenerManager = new EventListenerManager();
  watch(() => eventTargetRef.value, (element) => {
    eventListenerManager.removeListenerIfExists();
    if (!element) {
      return;
    }
    eventListenerManager.addListener(element, eventType, eventHandler);
  }, { immediate: true });

  onTeardown(() => {
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
    eventHandler: TypedEventHandler<TEvent>,
  ) {
    const listener = eventHandler as EventListener;
    eventTarget.addEventListener(eventType, listener);
    this.removeListener = () => eventTarget.removeEventListener(eventType, listener);
  }
}

type TypedEventHandler<
  TEvent extends (keyof HTMLElementEventMap),
> = ((event: HTMLElementEventMap[TEvent]) => void);
