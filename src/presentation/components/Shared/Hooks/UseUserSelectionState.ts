import { shallowReadonly, shallowRef, triggerRef } from 'vue';
import { IReadOnlyUserSelection, IUserSelection } from '@/application/Context/State/Selection/IUserSelection';
import type { useAutoUnsubscribedEvents } from './UseAutoUnsubscribedEvents';
import type { useCollectionState } from './UseCollectionState';

export function useUserSelectionState(
  collectionState: ReturnType<typeof useCollectionState>,
  autoUnsubscribedEvents: ReturnType<typeof useAutoUnsubscribedEvents>,
) {
  const { events } = autoUnsubscribedEvents;
  const { onStateChange, modifyCurrentState, currentState } = collectionState;

  const currentSelection = shallowRef<IReadOnlyUserSelection>(currentState.value.selection);

  onStateChange((state) => {
    updateSelection(state.selection);
    events.unsubscribeAllAndRegister([
      state.selection.changed.on(() => {
        updateSelection(state.selection);
      }),
    ]);
  }, { immediate: true });

  function modifyCurrentSelection(mutator: SelectionModifier) {
    modifyCurrentState((state) => {
      mutator(state.selection);
    });
  }

  function updateSelection(newSelection: IReadOnlyUserSelection) {
    if (currentSelection.value === newSelection) {
      // Do not trust Vue tracking, the changed selection object
      // reference may stay same for same collection.
      triggerRef(currentSelection);
    } else {
      currentSelection.value = newSelection;
    }
  }

  return {
    currentSelection: shallowReadonly(currentSelection),
    modifyCurrentSelection,
  };
}

export type SelectionModifier = (
  state: IUserSelection,
) => void;
