import { ReadOnlyTreeNode } from '../../Node/TreeNode';
import { RenderQueueOrderer } from './RenderQueueOrderer';

export class CollapsedParentOrderer implements RenderQueueOrderer {
  public orderNodes(nodes: Iterable<ReadOnlyTreeNode>): ReadOnlyTreeNode[] {
    return orderNodes(nodes);
  }
}

function orderNodes(nodes: Iterable<ReadOnlyTreeNode>): ReadOnlyTreeNode[] {
  return [...nodes]
    .map((node, index) => ({ node, index }))
    .sort((a, b) => {
      const [
        isANodeOfCollapsedParent,
        isBNodeOfCollapsedParent,
      ] = [isParentCollapsed(a.node), isParentCollapsed(b.node)];
      if (isANodeOfCollapsedParent !== isBNodeOfCollapsedParent) {
        return (isANodeOfCollapsedParent ? 1 : 0) - (isBNodeOfCollapsedParent ? 1 : 0);
      }
      return a.index - b.index;
    })
    .map(({ node }) => node);
}

function isParentCollapsed(node: ReadOnlyTreeNode): boolean {
  const parentNode = node.hierarchy.parent;
  if (parentNode) {
    if (!parentNode.state.current.isExpanded) {
      return true;
    }
    return isParentCollapsed(parentNode);
  }
  return false;
}
