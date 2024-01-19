import { ReadOnlyTreeNode, TreeNode } from '../../../Node/TreeNode';

export interface ReadOnlyQueryableNodes {
  readonly rootNodes: readonly ReadOnlyTreeNode[];
  readonly flattenedNodes: readonly ReadOnlyTreeNode[];

  getNodeById(id: string): ReadOnlyTreeNode;
}

export interface QueryableNodes extends ReadOnlyQueryableNodes {
  readonly rootNodes: readonly TreeNode[];
  readonly flattenedNodes: readonly TreeNode[];

  getNodeById(id: string): TreeNode;
}
