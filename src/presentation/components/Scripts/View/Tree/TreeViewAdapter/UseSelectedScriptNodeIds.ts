import {
  computed, shallowReadonly,
} from 'vue';
import type { useUserSelectionState } from '@/presentation/components/Shared/Hooks/UseUserSelectionState';
import { createNodeIdForExecutable } from './CategoryNodeMetadataConverter';
import type { TreeNodeId } from '../TreeView/Node/TreeNode';

export function useSelectedScriptNodeIds(
  useSelectionStateHook: ReturnType<typeof useUserSelectionState>,
  convertToNodeId = createNodeIdForExecutable,
) {
  const { currentSelection } = useSelectionStateHook;

  const selectedNodeIds = computed<readonly TreeNodeId[]>(() => {
    return currentSelection
      .value
      .scripts
      .selectedScripts
      .map((selected) => convertToNodeId(selected.script));
  });

  return {
    selectedScriptNodeIds: shallowReadonly(selectedNodeIds),
  };
}
