import { WatchSource, watch } from 'vue';
import { TreeRoot } from './TreeRoot/TreeRoot';
import { TreeNode } from './Node/TreeNode';
import { QueryableNodes } from './TreeRoot/NodeCollection/Query/QueryableNodes';
import { useCurrentTreeNodes } from './UseCurrentTreeNodes';
import { TreeNodeCheckState } from './Node/State/CheckState';

export function useLeafNodeCheckedStateUpdater(
  treeWatcher: WatchSource<TreeRoot>,
  leafNodeIdsWatcher: WatchSource<readonly string[]>,
) {
  const { nodes } = useCurrentTreeNodes(treeWatcher);

  watch(
    [leafNodeIdsWatcher, () => nodes.value],
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
