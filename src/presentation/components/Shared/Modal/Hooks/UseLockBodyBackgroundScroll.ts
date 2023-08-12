import { Ref, watch, onBeforeUnmount } from 'vue';

/*
  It blocks background scrolling.
  Designed to be used by modals, overlays etc.
*/
export function useLockBodyBackgroundScroll(isActive: Ref<boolean>) {
  const originalStyles = {
    overflow: document.body.style.overflow,
    width: document.body.style.width,
  };

  const block = () => {
    originalStyles.overflow = document.body.style.overflow;
    originalStyles.width = document.body.style.width;

    document.body.style.overflow = 'hidden';
    document.body.style.width = '100vw';
  };

  const unblock = () => {
    document.body.style.overflow = originalStyles.overflow;
    document.body.style.width = originalStyles.width;
  };

  watch(isActive, (shouldBlock) => {
    if (shouldBlock) {
      block();
    } else {
      unblock();
    }
  }, { immediate: true });

  onBeforeUnmount(() => {
    unblock();
  });
}
