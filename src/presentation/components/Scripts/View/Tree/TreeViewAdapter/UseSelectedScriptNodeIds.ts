import {
  computed, inject, shallowReadonly, shallowRef,
} from 'vue';
import { InjectionKeys } from '@/presentation/injectionSymbols';
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
  const { events } = inject(InjectionKeys.useAutoUnsubscribedEvents)();
  const { onStateChange } = inject(InjectionKeys.useCollectionState)();

  const selectedScripts = shallowRef<readonly SelectedScript[]>([]);

  onStateChange((state) => {
    selectedScripts.value = state.selection.selectedScripts;
    events.unsubscribeAllAndRegister([
      state.selection.changed.on((scripts) => {
        selectedScripts.value = scripts;
      }),
    ]);
  }, { immediate: true });

  return {
    selectedScripts: shallowReadonly(selectedScripts),
  };
}
