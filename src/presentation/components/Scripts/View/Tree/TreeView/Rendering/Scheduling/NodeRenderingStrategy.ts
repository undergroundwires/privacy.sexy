import type { TreeNode } from '../../Node/TreeNode';

export interface NodeRenderingStrategy {
  shouldRender(node: TreeNode): boolean;
}
