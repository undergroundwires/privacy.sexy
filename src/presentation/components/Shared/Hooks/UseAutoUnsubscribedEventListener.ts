import {
  onBeforeUnmount,
  isRef,
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
) => createTargetEventListener(onTeardown);

export type EventTargetRef<T extends EventTarget> = Readonly<Ref<T | undefined>>;

export type EventTargetSource<T extends EventTarget> = EventTargetRef<T> | T;

export interface TargetEventListener {
  startListening<TEvent extends keyof HTMLElementEventMap>(
    eventTargetSource: EventTargetSource<HTMLElement>,
    eventType: TEvent,
    eventHandler: (event: HTMLElementEventMap[TEvent]) => void,
  ): void;
  startListening<TEvent extends keyof WindowEventMap>(
    eventTargetSource: EventTargetSource<Window>,
    eventType: TEvent,
    eventHandler: (event: WindowEventMap[TEvent]) => void,
  ): void;
  startListening<TEvent extends keyof DocumentEventMap>(
    eventTargetSource: EventTargetSource<Document>,
    eventType: TEvent,
    eventHandler: (event: DocumentEventMap[TEvent]) => void,
  ): void;
  startListening(
    eventTargetSource: EventTargetSource<EventTarget>,
    eventType: string,
    eventHandler: (event: Event) => void,
  ): void;
}

function startListening<TEvent extends keyof HTMLElementEventMap>(
  eventTargetSource: EventTargetSource<HTMLElement>,
  eventType: TEvent,
  eventHandler: (event: HTMLElementEventMap[TEvent]) => void,
  onTeardown: LifecycleHook,
): void;
function startListening<TEvent extends keyof WindowEventMap>(
  eventTargetSource: EventTargetSource<Window>,
  eventType: TEvent,
  eventHandler: (event: WindowEventMap[TEvent]) => void,
  onTeardown: LifecycleHook,
): void;
function startListening<TEvent extends keyof DocumentEventMap>(
  eventTargetSource: EventTargetSource<Document>,
  eventType: TEvent,
  eventHandler: (event: DocumentEventMap[TEvent]) => void,
  onTeardown: LifecycleHook,
): void;
function startListening(
  eventTargetSource: EventTargetSource<EventTarget>,
  eventType: string,
  eventHandler: (event: Event) => void,
  onTeardown: LifecycleHook,
): void;
function startListening(
  eventTargetSource: EventTargetSource<EventTarget>,
  eventType: string,
  eventHandler: (event: Event) => void,
  onTeardown: LifecycleHook,
): void {
  const eventTargetRef = isRef(eventTargetSource)
    ? eventTargetSource
    : shallowRef(eventTargetSource);
  startListeningRef(eventTargetRef, eventType, eventHandler, onTeardown);
}

function startListeningRef(
  eventTargetRef: EventTargetRef<EventTarget>,
  eventType: string,
  eventHandler: (event: Event) => void,
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

function createTargetEventListener(onTeardown: LifecycleHook): TargetEventListener {
  function listen<TEvent extends keyof HTMLElementEventMap>(
    eventTargetSource: EventTargetSource<HTMLElement>,
    eventType: TEvent,
    eventHandler: (event: HTMLElementEventMap[TEvent]) => void,
  ): void;
  function listen<TEvent extends keyof WindowEventMap>(
    eventTargetSource: EventTargetSource<Window>,
    eventType: TEvent,
    eventHandler: (event: WindowEventMap[TEvent]) => void,
  ): void;
  function listen<TEvent extends keyof DocumentEventMap>(
    eventTargetSource: EventTargetSource<Document>,
    eventType: TEvent,
    eventHandler: (event: DocumentEventMap[TEvent]) => void,
  ): void;
  function listen(
    eventTargetSource: EventTargetSource<EventTarget>,
    eventType: string,
    eventHandler: (event: Event) => void,
  ): void {
    startListening(eventTargetSource, eventType, eventHandler, onTeardown);
  }
  return { startListening: listen };
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

  public addListener(
    eventTarget: EventTarget,
    eventType: string,
    eventHandler: (event: Event) => void,
  ) {
    eventTarget.addEventListener(eventType, eventHandler);
    this.removeListener = () => eventTarget.removeEventListener(eventType, eventHandler);
  }
}
