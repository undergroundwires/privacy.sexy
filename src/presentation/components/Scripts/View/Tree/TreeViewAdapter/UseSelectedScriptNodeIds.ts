import {
  computed, shallowReadonly, shallowRef, triggerRef,
} from 'vue';
import { injectKey } from '@/presentation/injectionSymbols';
import { SelectedScript } from '@/application/Context/State/Selection/SelectedScript';
import { getScriptNodeId } from './CategoryNodeMetadataConverter';

export function useSelectedScriptNodeIds(scriptNodeIdParser = getScriptNodeId) {
  const { selectedScripts } = useSelectedScripts();

  const selectedNodeIds = computed<readonly string[]>(() => {
    return selectedScripts
      .value
      .map((selected) => scriptNodeIdParser(selected.script));
  });

  return {
    selectedScriptNodeIds: shallowReadonly(selectedNodeIds),
  };
}

function useSelectedScripts() {
  const { events } = injectKey((keys) => keys.useAutoUnsubscribedEvents);
  const { onStateChange } = injectKey((keys) => keys.useCollectionState);

  const selectedScripts = shallowRef<readonly SelectedScript[]>([]);

  function updateSelectedScripts(newReference: readonly SelectedScript[]) {
    if (selectedScripts.value === newReference) {
      // Manually trigger update if the array was mutated using the same reference.
      // Array might have been mutated without changing the reference
      triggerRef(selectedScripts);
    } else {
      selectedScripts.value = newReference;
    }
  }

  onStateChange((state) => {
    updateSelectedScripts(state.selection.selectedScripts);
    events.unsubscribeAllAndRegister([
      state.selection.changed.on((scripts) => {
        updateSelectedScripts(scripts);
      }),
    ]);
  }, { immediate: true });

  return {
    selectedScripts: shallowReadonly(selectedScripts),
  };
}
