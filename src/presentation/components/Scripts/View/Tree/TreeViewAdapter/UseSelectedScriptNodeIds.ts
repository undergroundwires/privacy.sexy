import {
  computed, shallowReadonly,
} from 'vue';
import type { useUserSelectionState } from '@/presentation/components/Shared/Hooks/UseUserSelectionState';
import { getScriptNodeId } from './CategoryNodeMetadataConverter';

export function useSelectedScriptNodeIds(
  useSelectionStateHook: ReturnType<typeof useUserSelectionState>,
  scriptNodeIdParser = getScriptNodeId,
) {
  const { currentSelection } = useSelectionStateHook;

  const selectedNodeIds = computed<readonly string[]>(() => {
    return currentSelection
      .value
      .selectedScripts
      .map((selected) => scriptNodeIdParser(selected.script));
  });

  return {
    selectedScriptNodeIds: shallowReadonly(selectedNodeIds),
  };
}
