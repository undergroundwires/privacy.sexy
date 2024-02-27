import type { ReadOnlyTreeNode, TreeNode } from '../../Node/TreeNode';

export interface SingleNodeFocusManager {
  readonly currentSingleFocusedNode: TreeNode | undefined;
  setSingleFocus(focusedNode: ReadOnlyTreeNode): void;
}
