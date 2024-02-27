import { type Ref, watch } from 'vue';
import { useCurrentTreeNodes } from './UseCurrentTreeNodes';
import { TreeNodeCheckState } from './Node/State/CheckState';
import type { TreeRoot } from './TreeRoot/TreeRoot';
import type { TreeNode } from './Node/TreeNode';
import type { QueryableNodes } from './TreeRoot/NodeCollection/Query/QueryableNodes';

export function useLeafNodeCheckedStateUpdater(
  treeRootRef: Readonly<Ref<TreeRoot>>,
  leafNodeIdsRef: Readonly<Ref<readonly string[]>>,
) {
  const { nodes } = useCurrentTreeNodes(treeRootRef);

  watch(
    [leafNodeIdsRef, nodes],
    ([nodeIds, actualNodes]) => {
      updateNodeSelections(actualNodes, nodeIds);
    },
    { immediate: true },
  );
}

function updateNodeSelections(
  nodes: QueryableNodes,
  selectedNodeIds: readonly string[],
) {
  nodes.flattenedNodes.forEach((node) => {
    updateNodeSelection(node, selectedNodeIds);
  });
}

function updateNodeSelection(
  node: TreeNode,
  selectedNodeIds: readonly string[],
) {
  if (!node.hierarchy.isLeafNode) {
    return;
  }
  const newState = selectedNodeIds.includes(node.id)
    ? TreeNodeCheckState.Checked
    : TreeNodeCheckState.Unchecked;
  node.state.commitTransaction(node.state.beginTransaction().withCheckState(newState));
}
