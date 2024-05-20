import {
  onBeforeMount, onBeforeUnmount,
  watch, type Ref,
} from 'vue';
import { throttle, type ThrottleFunction } from '@/application/Common/Timing/Throttle';
import { useResizeObserverPolyfill } from './UseResizeObserverPolyfill';
import { useAnimationFrameLimiter } from './UseAnimationFrameLimiter';

export function useResizeObserver(
  config: ResizeObserverConfig,
  usePolyfill = useResizeObserverPolyfill,
  useFrameLimiter = useAnimationFrameLimiter,
  throttler: ThrottleFunction = throttle,
  onSetup: LifecycleHookRegistration = onBeforeMount,
  onTeardown: LifecycleHookRegistration = onBeforeUnmount,
) {
  const { resetNextFrame, cancelNextFrame } = useFrameLimiter();
  // This prevents the 'ResizeObserver loop completed with undelivered notifications' error when
  // the browser can't process all observations within one animation frame.
  // Reference: https://github.com/WICG/resize-observer/issues/38

  const { resizeObserverReady } = usePolyfill();
  // This ensures compatibility with ancient browsers. All modern browsers support ResizeObserver.
  // Compatibility info: https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver#browser_compatibility

  const throttledCallback = throttler(config.observeCallback, config.throttleInMs);
  // Throttling enhances performance during rapid changes such as window resizing.

  let observer: ResizeObserver | null;

  const disposeObserver = () => {
    cancelNextFrame();
    observer?.disconnect();
    observer = null;
  };

  onSetup(() => {
    watch(() => config.observedElementRef.value, (element) => {
      if (!element) {
        disposeObserver();
        return;
      }
      resizeObserverReady.then((createObserver) => {
        disposeObserver();
        observer = createObserver((...args) => {
          resetNextFrame(() => throttledCallback(...args));
        });
        observer.observe(element, config?.observeOptions);
      });
    }, { immediate: true });
  });

  onTeardown(() => {
    disposeObserver();
  });
}

export interface ResizeObserverConfig {
  readonly observedElementRef: ObservedElementReference;
  readonly throttleInMs: number;
  readonly observeCallback: ResizeObserverCallback;
  readonly observeOptions?: ResizeObserverOptions;
}

export type ObservedElementReference = Readonly<Ref<HTMLElement | undefined>>;

export type LifecycleHookRegistration = (callback: () => void) => void;
