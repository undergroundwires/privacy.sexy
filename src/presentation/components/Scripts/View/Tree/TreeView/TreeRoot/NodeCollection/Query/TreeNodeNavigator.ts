import { TreeNode } from '../../../Node/TreeNode';
import { QueryableNodes } from './QueryableNodes';

export class TreeNodeNavigator implements QueryableNodes {
  public readonly flattenedNodes: readonly TreeNode[];

  constructor(public readonly rootNodes: readonly TreeNode[]) {
    this.flattenedNodes = flattenNodes(rootNodes);
  }

  public getNodeById(id: string): TreeNode {
    const foundNode = this.flattenedNodes.find((node) => node.id === id);
    if (!foundNode) {
      throw new Error(`Node could not be found: ${id}`);
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
