import type { ReadOnlyTreeNode, TreeNode, TreeNodeId } from '../../../Node/TreeNode';

export interface ReadOnlyQueryableNodes {
  readonly rootNodes: readonly ReadOnlyTreeNode[];
  readonly flattenedNodes: readonly ReadOnlyTreeNode[];

  getNodeById(nodeId: TreeNodeId): ReadOnlyTreeNode;
}

export interface QueryableNodes extends ReadOnlyQueryableNodes {
  readonly rootNodes: readonly TreeNode[];
  readonly flattenedNodes: readonly TreeNode[];

  getNodeById(nodeId: TreeNodeId): TreeNode;
}
