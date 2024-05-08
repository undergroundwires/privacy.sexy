import { useAutoUnsubscribedEventListener, type UseEventListener } from '@/presentation/components/Shared/Hooks/UseAutoUnsubscribedEventListener';

export function useEscapeKeyListener(
  callback: () => void,
  eventTarget: EventTarget = document,
  useEventListener: UseEventListener = useAutoUnsubscribedEventListener,
): void {
  const { startListening } = useEventListener();
  startListening(eventTarget, 'keyup', (event) => {
    if (event.key === 'Escape') {
      callback();
    }
  });
}
