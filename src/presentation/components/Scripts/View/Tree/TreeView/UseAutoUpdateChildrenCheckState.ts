import { WatchSource } from 'vue';
import { TreeRoot } from './TreeRoot/TreeRoot';
import { useNodeStateChangeAggregator } from './UseNodeStateChangeAggregator';
import { HierarchyAccess } from './Node/Hierarchy/HierarchyAccess';
import { TreeNodeCheckState } from './Node/State/CheckState';

export function useAutoUpdateChildrenCheckState(
  treeWatcher: WatchSource<TreeRoot>,
) {
  const { onNodeStateChange } = useNodeStateChangeAggregator(treeWatcher);

  onNodeStateChange((node, change) => {
    if (change.newState.checkState === change.oldState.checkState) {
      return;
    }
    updateChildrenCheckedState(node.hierarchy, change.newState.checkState);
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
