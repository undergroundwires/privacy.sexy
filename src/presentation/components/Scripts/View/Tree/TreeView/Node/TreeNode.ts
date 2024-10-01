import type { HierarchyAccess, HierarchyReader } from './Hierarchy/HierarchyAccess';
import type { TreeNodeStateAccess, TreeNodeStateReader } from './State/StateAccess';

export type TreeNodeId = string;

export interface ReadOnlyTreeNode {
  readonly id: TreeNodeId;
  readonly state: TreeNodeStateReader;
  readonly hierarchy: HierarchyReader;
  readonly metadata?: object;
}

export interface TreeNode extends ReadOnlyTreeNode {
  readonly state: TreeNodeStateAccess;
  readonly hierarchy: HierarchyAccess;
}
