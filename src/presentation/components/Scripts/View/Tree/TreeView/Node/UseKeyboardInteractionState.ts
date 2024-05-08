import { ref } from 'vue';
import { useAutoUnsubscribedEventListener, type UseEventListener } from '@/presentation/components/Shared/Hooks/UseAutoUnsubscribedEventListener';

export function useKeyboardInteractionState(
  eventTarget: EventTarget = DefaultEventSource,
  useEventListener: UseEventListener = useAutoUnsubscribedEventListener,
) {
  const { startListening } = useEventListener();
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

  startListening(eventTarget, 'keydown', enableKeyboardFocus);
  startListening(eventTarget, 'click', disableKeyboardFocus);

  return { isKeyboardBeingUsed };
}

export const DefaultEventSource = document;
