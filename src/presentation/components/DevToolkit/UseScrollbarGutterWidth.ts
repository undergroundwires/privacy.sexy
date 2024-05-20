import {
  computed, readonly, ref, shallowRef, watch,
} from 'vue';
import { throttle } from '@/application/Common/Timing/Throttle';
import { useAutoUnsubscribedEventListener } from '../Shared/Hooks/UseAutoUnsubscribedEventListener';
import { useResizeObserver } from '../Shared/Hooks/Resize/UseResizeObserver';

const RESIZE_EVENT_THROTTLE_MS = 200;

export function useScrollbarGutterWidth() {
  const scrollbarWidthInPx = ref(getScrollbarGutterWidth());

  const { startListening } = useAutoUnsubscribedEventListener();
  startListening(window, 'resize', throttle(() => {
    scrollbarWidthInPx.value = getScrollbarGutterWidth();
  }, RESIZE_EVENT_THROTTLE_MS));

  const bodyWidth = useBodyWidth();
  watch(() => bodyWidth.value, () => {
    scrollbarWidthInPx.value = getScrollbarGutterWidth();
  }, { immediate: false });

  const scrollbarWidthStyle = computed(() => `${scrollbarWidthInPx.value}px`);
  return readonly(scrollbarWidthStyle);
}

function getScrollbarGutterWidth(): number {
  return document.documentElement.clientWidth - document.documentElement.offsetWidth;
}

function useBodyWidth() {
  const width = ref(document.body.offsetWidth);
  useResizeObserver(
    {
      observedElementRef: shallowRef(document.body),
      throttleInMs: RESIZE_EVENT_THROTTLE_MS,
      observeCallback: (entries) => {
        for (const entry of entries) {
          width.value = entry.borderBoxSize[0].inlineSize;
        }
      },
      observeOptions: { box: 'border-box' },
    },
  );
  return readonly(width);
}
