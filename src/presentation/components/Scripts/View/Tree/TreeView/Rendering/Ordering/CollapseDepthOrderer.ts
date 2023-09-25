import { ReadOnlyTreeNode } from '../../Node/TreeNode';
import { RenderQueueOrderer } from './RenderQueueOrderer';

export class CollapseDepthOrderer implements RenderQueueOrderer {
  public orderNodes(nodes: Iterable<ReadOnlyTreeNode>): ReadOnlyTreeNode[] {
    return orderNodes(nodes);
  }
}

function orderNodes(nodes: Iterable<ReadOnlyTreeNode>): ReadOnlyTreeNode[] {
  return [...nodes]
    .sort((a, b) => {
      const [aCollapseStatus, bCollapseStatus] = [isNodeCollapsed(a), isNodeCollapsed(b)];
      if (aCollapseStatus !== bCollapseStatus) {
        return (aCollapseStatus ? 1 : 0) - (bCollapseStatus ? 1 : 0);
      }
      return a.hierarchy.depthInTree - b.hierarchy.depthInTree;
    });
}

function isNodeCollapsed(node: ReadOnlyTreeNode): boolean {
  if (!node.state.current.isExpanded) {
    return true;
  }
  if (node.hierarchy.parent) {
    return isNodeCollapsed(node.hierarchy.parent);
  }
  return false;
}
