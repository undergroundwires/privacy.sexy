import { onBeforeMount, onBeforeUnmount } from 'vue';

export function useEscapeKeyListener(callback: () => void) {
  const onKeyUp = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      callback();
    }
  };

  onBeforeMount(() => {
    window.addEventListener('keyup', onKeyUp);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('keyup', onKeyUp);
  });
}
