import { onMounted } from 'vue';
import { AsyncLazy } from '@/infrastructure/Threading/AsyncLazy';

// AsyncLazy ensures single load of the ResizeObserver polyfill,
// even when multiple calls are made simultaneously.
const polyfillLoader = new AsyncLazy(async () => {
  if ('ResizeObserver' in window) {
    return window.ResizeObserver;
  }
  const module = await import('@juggle/resize-observer');
  globalThis.window.ResizeObserver = module.ResizeObserver;
  return module.ResizeObserver;
});

async function polyfillResizeObserver(): Promise<typeof ResizeObserver> {
  return polyfillLoader.getValue();
}

interface ResizeObserverCreator {
  (
    ...args: ConstructorParameters<typeof ResizeObserver>
  ): ResizeObserver;
}

export function useResizeObserverPolyfill() {
  const resizeObserverReady = new Promise<ResizeObserverCreator>((resolve) => {
    onMounted(async () => {
      await polyfillResizeObserver();
      resolve((args) => new ResizeObserver(args));
    });
  });
  return { resizeObserverReady };
}
