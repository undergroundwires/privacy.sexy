import type { ReadOnlyTreeNode } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/TreeNode';
import type { RenderQueueOrderer } from '@/presentation/components/Scripts/View/Tree/TreeView/Rendering/Ordering/RenderQueueOrderer';

export class RenderQueueOrdererStub implements RenderQueueOrderer {
  public orderNodes(nodes: Iterable<ReadOnlyTreeNode>): ReadOnlyTreeNode[] {
    return [...nodes];
  }
}
