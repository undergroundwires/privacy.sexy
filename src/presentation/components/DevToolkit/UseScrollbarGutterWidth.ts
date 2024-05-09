import {
  computed, readonly, ref, watch,
} from 'vue';
import { throttle } from '@/application/Common/Timing/Throttle';
import { useAutoUnsubscribedEventListener } from '../Shared/Hooks/UseAutoUnsubscribedEventListener';

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
  const observer = new ResizeObserver((entries) => throttle(() => {
    for (const entry of entries) {
      width.value = entry.borderBoxSize[0].inlineSize;
    }
  }, RESIZE_EVENT_THROTTLE_MS));
  observer.observe(document.body, { box: 'border-box' });
  return readonly(width);
}
