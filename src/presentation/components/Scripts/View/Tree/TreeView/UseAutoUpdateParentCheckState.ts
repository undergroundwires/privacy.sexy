import { TreeRoot } from './TreeRoot/TreeRoot';
import { useNodeStateChangeAggregator } from './UseNodeStateChangeAggregator';
import { HierarchyAccess } from './Node/Hierarchy/HierarchyAccess';
import { TreeNodeCheckState } from './Node/State/CheckState';
import { ReadOnlyTreeNode } from './Node/TreeNode';
import type { Ref } from 'vue';

export function useAutoUpdateParentCheckState(
  treeRef: Readonly<Ref<TreeRoot>>,
  useChangeAggregator = useNodeStateChangeAggregator,
) {
  const { onNodeStateChange } = useChangeAggregator(treeRef);

  onNodeStateChange((change) => {
    if (change.newState.checkState === change.oldState?.checkState) {
      return;
    }
    updateNodeParentCheckedState(change.node.hierarchy);
  });
}

function updateNodeParentCheckedState(
  node: HierarchyAccess,
) {
  const { parent } = node;
  if (!parent) {
    return;
  }
  const newState = getNewStateCheckedStateBasedOnChildren(parent);
  if (newState === parent.state.current.checkState) {
    return;
  }
  parent.state.commitTransaction(
    parent.state.beginTransaction().withCheckState(newState),
  );
}

function getNewStateCheckedStateBasedOnChildren(node: ReadOnlyTreeNode): TreeNodeCheckState {
  const { children } = node.hierarchy;
  const childrenStates = children.map((child) => child.state.current.checkState);
  if (childrenStates.every((state) => state === TreeNodeCheckState.Unchecked)) {
    return TreeNodeCheckState.Unchecked;
  }
  if (childrenStates.every((state) => state === TreeNodeCheckState.Checked)) {
    return TreeNodeCheckState.Checked;
  }
  return TreeNodeCheckState.Indeterminate;
}
