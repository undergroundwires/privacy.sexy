import { TreeInputNodeData } from '../../Bindings/TreeInputNodeData';
import { TreeNode } from '../../Node/TreeNode';
import { TreeNodeManager } from '../../Node/TreeNodeManager';

export function parseTreeInput(
  input: readonly TreeInputNodeData[],
): TreeNode[] {
  if (!Array.isArray(input)) {
    throw new Error('input data must be an array');
  }
  const nodes = input.map((nodeData) => createNode(nodeData));
  return nodes;
}

function createNode(input: TreeInputNodeData): TreeNode {
  const node = new TreeNodeManager(input.id, input.data);
  node.hierarchy.setChildren(input.children?.map((child) => {
    const childNode = createNode(child);
    childNode.hierarchy.setParent(node);
    return childNode;
  }) ?? []);
  return node;
}
