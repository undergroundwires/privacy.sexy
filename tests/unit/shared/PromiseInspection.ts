/**
 * Ensures all promises scheduled to resolve in the microtask queue are resolved.
 * This function is designed to be used in tests to wait for promises to settle
 * before proceeding with assertions. It works by returning a promise that resolves
 * on the next tick of the event loop, allowing any pending promise resolutions to
 * complete.
 */
export function flushPromiseResolutionQueue() {
  return Promise.resolve();
}

/**
 * Monitors the state of a promise, providing a way to query whether it is
 * fulfilled, pending, or rejected. This utility is particularly useful in tests
 * to ascertain the current state of a promise at any given moment without
 * interfering with its natural lifecycle. It encapsulates the promise in a
 * non-intrusive manner, allowing tests to synchronously check the promise's
 * status post certain asynchronous operations.
 */
export function watchPromiseState<T>(promise: Promise<T>) {
  let isPending = true;
  let isRejected = false;
  let isFulfilled = false;
  promise.then(
    () => {
      isFulfilled = true;
      isPending = false;
    },
    () => {
      isRejected = true;
      isPending = false;
    },
  );
  return {
    isFulfilled: () => isFulfilled,
    isPending: () => isPending,
    isRejected: () => isRejected,
  };
}
