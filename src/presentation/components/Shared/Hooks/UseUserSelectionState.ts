import { shallowReadonly, shallowRef, triggerRef } from 'vue';
import type { ReadonlyUserSelection, UserSelection } from '@/application/Context/State/Selection/UserSelection';
import type { useAutoUnsubscribedEvents } from './UseAutoUnsubscribedEvents';
import type { useCollectionState } from './UseCollectionState';

export function useUserSelectionState(
  collectionState: ReturnType<typeof useCollectionState>,
  autoUnsubscribedEvents: ReturnType<typeof useAutoUnsubscribedEvents>,
) {
  const { events } = autoUnsubscribedEvents;
  const { onStateChange, modifyCurrentState, currentState } = collectionState;

  const currentSelection = shallowRef<ReadonlyUserSelection>(currentState.value.selection);

  onStateChange((state) => {
    updateSelection(state.selection);
    events.unsubscribeAllAndRegister([
      state.selection.scripts.changed.on(() => {
        updateSelection(state.selection);
      }),
    ]);
  }, { immediate: true });

  function modifyCurrentSelection(mutator: SelectionModifier) {
    modifyCurrentState((state) => {
      mutator(state.selection);
    });
  }

  function updateSelection(newSelection: ReadonlyUserSelection) {
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
  state: UserSelection,
) => void;
