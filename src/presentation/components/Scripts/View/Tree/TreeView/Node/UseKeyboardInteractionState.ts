import { ref, onMounted, onUnmounted } from 'vue';

export function useKeyboardInteractionState(window: WindowWithEventListeners = globalThis.window) {
  const isKeyboardBeingUsed = ref(false);

  const enableKeyboardFocus = () => {
    if (isKeyboardBeingUsed.value) {
      return;
    }
    isKeyboardBeingUsed.value = true;
  };

  const disableKeyboardFocus = () => {
    if (!isKeyboardBeingUsed.value) {
      return;
    }
    isKeyboardBeingUsed.value = false;
  };

  onMounted(() => {
    window.addEventListener('keydown', enableKeyboardFocus, true);
    window.addEventListener('click', disableKeyboardFocus, true);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', enableKeyboardFocus);
    window.removeEventListener('click', disableKeyboardFocus);
  });

  return { isKeyboardBeingUsed };
}

export interface WindowWithEventListeners {
  addEventListener: typeof global.window.addEventListener;
  removeEventListener: typeof global.window.removeEventListener;
}
