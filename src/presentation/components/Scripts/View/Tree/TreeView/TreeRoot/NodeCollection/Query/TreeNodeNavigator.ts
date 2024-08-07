import type { QueryableNodes } from './QueryableNodes';
import type { TreeNode, TreeNodeId } from '../../../Node/TreeNode';

export class TreeNodeNavigator implements QueryableNodes {
  public readonly flattenedNodes: readonly TreeNode[];

  constructor(public readonly rootNodes: readonly TreeNode[]) {
    this.flattenedNodes = flattenNodes(rootNodes);
  }

  public getNodeById(nodeId: TreeNodeId): TreeNode {
    const foundNode = this.flattenedNodes.find((node) => node.id === nodeId);
    if (!foundNode) {
      throw new Error(`Node could not be found: ${nodeId}`);
    }
    return foundNode;
  }
}

function flattenNodes(nodes: readonly TreeNode[]): TreeNode[] {
  return nodes.reduce((flattenedNodes, node) => {
    flattenedNodes.push(node);
    if (node.hierarchy.children) {
      flattenedNodes.push(...flattenNodes(node.hierarchy.children));
    }
    return flattenedNodes;
  }, new Array<TreeNode>());
}
