import { NodeMetadata } from '../NodeContent/NodeMetadata';
import { ReadOnlyTreeNode } from '../TreeView/Node/TreeNode';
import { TreeInputNodeData } from '../TreeView/Bindings/TreeInputNodeData';

export function getNodeMetadata(
  treeNode: ReadOnlyTreeNode,
): NodeMetadata {
  if (!treeNode) { throw new Error('missing tree node'); }
  const data = treeNode.metadata as NodeMetadata;
  if (!data) {
    throw new Error('Provided node does not contain the expected metadata.');
  }
  return data;
}

export function convertToNodeInput(metadata: NodeMetadata): TreeInputNodeData {
  if (!metadata) { throw new Error('missing metadata'); }
  return {
    id: metadata.id,
    children: convertChildren(metadata.children, convertToNodeInput),
    data: metadata,
  };
}

function convertChildren<TOldNode, TNewNode>(
  oldChildren: readonly TOldNode[],
  callback: (value: TOldNode) => TNewNode,
): TNewNode[] {
  if (!oldChildren || oldChildren.length === 0) {
    return [];
  }
  return oldChildren.map((childNode) => callback(childNode));
}
