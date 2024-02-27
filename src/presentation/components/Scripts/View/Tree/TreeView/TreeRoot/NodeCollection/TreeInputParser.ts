import { isArray } from '@/TypeHelpers';
import { TreeNodeManager } from '../../Node/TreeNodeManager';
import type { TreeInputNodeData } from '../../Bindings/TreeInputNodeData';
import type { TreeNode } from '../../Node/TreeNode';

export function parseTreeInput(
  input: readonly TreeInputNodeData[],
): TreeNode[] {
  if (!isArray(input)) {
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
