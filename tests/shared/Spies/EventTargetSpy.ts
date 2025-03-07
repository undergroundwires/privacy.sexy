export function createEventSpies(
  eventTarget: EventTarget,
  restoreCallback: (restoreFunc: () => void) => void,
) {
  const currentListeners = new Array<Parameters<typeof eventTarget.addEventListener>>();
  const dispatchedEvents = new Array<Event>();

  const addEventListenerCalls = new Array<Parameters<typeof eventTarget.addEventListener>>();
  const removeEventListenerCalls = new Array<Parameters<typeof eventTarget.removeEventListener>>();

  const originalAddEventListener = eventTarget.addEventListener;
  eventTarget.addEventListener = (
    ...args: Parameters<typeof eventTarget.addEventListener>
  ): ReturnType<typeof eventTarget.addEventListener> => {
    addEventListenerCalls.push(args);
    currentListeners.push(args);
    return originalAddEventListener.call(eventTarget, ...args);
  };

  const originalRemoveEventListener = eventTarget.removeEventListener;
  eventTarget.removeEventListener = (
    ...args: Parameters<typeof eventTarget.removeEventListener>
  ): ReturnType<typeof eventTarget.removeEventListener> => {
    removeEventListenerCalls.push(args);
    const [type, listener] = args;
    const registeredListener = findCurrentListener(type, listener);
    if (registeredListener) {
      const index = currentListeners.indexOf(registeredListener);
      if (index > -1) {
        currentListeners.splice(index, 1);
      }
    }
    return originalRemoveEventListener.call(eventTarget, ...args);
  };

  const originalDispatchEvent = eventTarget.dispatchEvent;
  eventTarget.dispatchEvent = (event) => {
    dispatchedEvents.push(event);
    return originalDispatchEvent.call(eventTarget, event);
  };

  function findCurrentListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
  ): Parameters<typeof eventTarget.addEventListener> | undefined {
    return currentListeners.find((args) => {
      const [eventType, eventListener] = args;
      return eventType === type && listener === eventListener;
    });
  }

  restoreCallback(() => {
    eventTarget.addEventListener = originalAddEventListener;
    eventTarget.removeEventListener = originalRemoveEventListener;
  });

  return {
    isAddEventCalled(eventType: string): boolean {
      const call = addEventListenerCalls.find((args) => {
        const [type] = args;
        return type === eventType;
      });
      return call !== undefined;
    },
    isRemoveEventCalled(eventType: string): boolean {
      const call = removeEventListenerCalls.find((args) => {
        const [type] = args;
        return type === eventType;
      });
      return call !== undefined;
    },
    formatListeners: (): string => {
      return JSON.stringify(currentListeners);
    },
    isEventDispatched(eventType: string): boolean {
      return dispatchedEvents.find((e) => e.type === eventType) !== undefined;
    },
  };
}
