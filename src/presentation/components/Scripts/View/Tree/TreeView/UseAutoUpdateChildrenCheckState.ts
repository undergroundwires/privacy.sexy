import { useNodeStateChangeAggregator } from './UseNodeStateChangeAggregator';
import { TreeNodeCheckState } from './Node/State/CheckState';
import type { TreeRoot } from './TreeRoot/TreeRoot';
import type { HierarchyAccess } from './Node/Hierarchy/HierarchyAccess';
import type { Ref } from 'vue';

export function useAutoUpdateChildrenCheckState(
  treeRootRef: Readonly<Ref<TreeRoot>>,
  useChangeAggregator = useNodeStateChangeAggregator,
) {
  const { onNodeStateChange } = useChangeAggregator(treeRootRef);

  onNodeStateChange((change) => {
    if (change.newState.checkState === change.oldState?.checkState) {
      return;
    }
    updateChildrenCheckedState(change.node.hierarchy, change.newState.checkState);
  });
}

function updateChildrenCheckedState(
  node: HierarchyAccess,
  newParentState: TreeNodeCheckState,
) {
  if (node.isLeafNode) {
    return;
  }
  if (!shouldUpdateChildren(newParentState)) {
    return;
  }
  const { children } = node;
  children.forEach((childNode) => {
    if (childNode.state.current.checkState === newParentState) {
      return;
    }
    childNode.state.commitTransaction(
      childNode.state.beginTransaction().withCheckState(newParentState),
    );
  });
}

function shouldUpdateChildren(newParentState: TreeNodeCheckState) {
  return newParentState === TreeNodeCheckState.Checked
    || newParentState === TreeNodeCheckState.Unchecked;
}
