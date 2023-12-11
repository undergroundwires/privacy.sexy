export type EventName = keyof WindowEventMap;

export function createWindowEventSpies(restoreCallback: (restoreFunc: () => void) => void) {
  const originalAddEventListener = window.addEventListener;
  const originalRemoveEventListener = window.removeEventListener;

  const currentListeners = new Array<Parameters<typeof window.addEventListener>>();

  const addEventListenerCalls = new Array<Parameters<typeof window.addEventListener>>();
  const removeEventListenerCalls = new Array<Parameters<typeof window.removeEventListener>>();

  window.addEventListener = (
    ...args: Parameters<typeof window.addEventListener>
  ): ReturnType<typeof window.addEventListener> => {
    addEventListenerCalls.push(args);
    currentListeners.push(args);
    return originalAddEventListener.call(window, ...args);
  };

  window.removeEventListener = (
    ...args: Parameters<typeof window.removeEventListener>
  ): ReturnType<typeof window.removeEventListener> => {
    removeEventListenerCalls.push(args);
    const [type, listener] = args;
    const registeredListener = findCurrentListener(type as EventName, listener);
    if (registeredListener) {
      const index = currentListeners.indexOf(registeredListener);
      if (index > -1) {
        currentListeners.splice(index, 1);
      }
    }
    return originalRemoveEventListener.call(window, ...args);
  };

  function findCurrentListener(
    type: EventName,
    listener: EventListenerOrEventListenerObject,
  ): Parameters<typeof window.addEventListener> | undefined {
    return currentListeners.find((args) => {
      const [eventType, eventListener] = args;
      return eventType === type && listener === eventListener;
    });
  }

  restoreCallback(() => {
    window.addEventListener = originalAddEventListener;
    window.removeEventListener = originalRemoveEventListener;
  });

  return {
    isAddEventCalled(eventType: EventName): boolean {
      const call = addEventListenerCalls.find((args) => {
        const [type] = args;
        return type === eventType;
      });
      return call !== undefined;
    },
    isRemoveEventCalled(eventType: EventName) {
      const call = removeEventListenerCalls.find((args) => {
        const [type] = args;
        return type === eventType;
      });
      return call !== undefined;
    },
    currentListeners,
  };
}
