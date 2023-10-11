import { WatchSource, watch } from 'vue';

export function waitForValueChange<T>(valueWatcher: WatchSource<T>, timeoutMs = 2000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const unwatch = watch(valueWatcher, (newValue, oldValue) => {
      if (newValue !== oldValue) {
        unwatch();
        resolve(newValue);
      }
    }, { immediate: false });

    setTimeout(() => {
      unwatch();
      reject(new Error('Timeout waiting for value to change.'));
    }, timeoutMs);
  });
}
