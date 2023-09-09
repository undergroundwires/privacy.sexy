import type { ReadOnlyTreeNode, TreeNode } from '../TreeNode';

export interface HierarchyReader {
  readonly depthInTree: number;
  readonly parent: ReadOnlyTreeNode | undefined;
  readonly children: readonly ReadOnlyTreeNode[];
  readonly isLeafNode: boolean;
  readonly isBranchNode: boolean;
}

export interface HierarchyWriter {
  setParent(parent: TreeNode): void;
  setChildren(children: readonly TreeNode[]): void;
}

export interface HierarchyAccess extends HierarchyReader, HierarchyWriter {
  readonly parent: TreeNode | undefined;
  readonly children: readonly TreeNode[];
}
