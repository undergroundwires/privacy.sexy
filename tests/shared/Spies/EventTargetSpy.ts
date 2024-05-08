export function createEventSpies(
  eventTarget: EventTarget,
  restoreCallback: (restoreFunc: () => void) => void,
) {
  const originalAddEventListener = eventTarget.addEventListener;
  const originalRemoveEventListener = eventTarget.removeEventListener;

  const currentListeners = new Array<Parameters<typeof eventTarget.addEventListener>>();

  const addEventListenerCalls = new Array<Parameters<typeof eventTarget.addEventListener>>();
  const removeEventListenerCalls = new Array<Parameters<typeof eventTarget.removeEventListener>>();

  eventTarget.addEventListener = (
    ...args: Parameters<typeof eventTarget.addEventListener>
  ): ReturnType<typeof eventTarget.addEventListener> => {
    addEventListenerCalls.push(args);
    currentListeners.push(args);
    return originalAddEventListener.call(eventTarget, ...args);
  };

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
    isRemoveEventCalled(eventType: string) {
      const call = removeEventListenerCalls.find((args) => {
        const [type] = args;
        return type === eventType;
      });
      return call !== undefined;
    },
    formatListeners: () => {
      return JSON.stringify(currentListeners);
    },
  };
}
