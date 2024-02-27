import { ref } from 'vue';
import type { IApplicationCode } from '@/application/Context/State/Code/IApplicationCode';
import type { IEventSubscriptionCollection } from '@/infrastructure/Events/IEventSubscriptionCollection';
import { useCollectionState } from './UseCollectionState';

export function useCurrentCode(
  state: ReturnType<typeof useCollectionState>,
  events: IEventSubscriptionCollection,
) {
  const { onStateChange } = state;

  const currentCode = ref<string>('');

  onStateChange((newState) => {
    updateCurrentCode(newState.code.current);
    subscribeToCodeChanges(newState.code);
  }, { immediate: true });

  function subscribeToCodeChanges(code: IApplicationCode) {
    events.unsubscribeAllAndRegister([
      code.changed.on((newCode) => updateCurrentCode(newCode.code)),
    ]);
  }

  function updateCurrentCode(newCode: string) {
    currentCode.value = newCode;
  }

  return {
    currentCode,
  };
}
