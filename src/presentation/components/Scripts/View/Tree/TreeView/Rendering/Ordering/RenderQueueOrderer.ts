import type { ReadOnlyTreeNode } from '../../Node/TreeNode';

export interface RenderQueueOrderer {
  orderNodes(nodes: Iterable<ReadOnlyTreeNode>): ReadOnlyTreeNode[];
}
