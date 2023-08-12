import { ILiquorTreeNode, ILiquorTreeNodeState } from 'liquor-tree';
import { NodeType } from '../../Node/INodeContent';

export function getNewState(
  node: ILiquorTreeNode,
  selectedNodeIds: ReadonlyArray<string>,
): ILiquorTreeNodeState {
  const checked = getNewCheckedState(node, selectedNodeIds);
  const indeterminate = !checked && getNewIndeterminateState(node, selectedNodeIds);
  return {
    checked, indeterminate,
  };
}

function getNewIndeterminateState(
  node: ILiquorTreeNode,
  selectedNodeIds: ReadonlyArray<string>,
): boolean {
  switch (node.data.type) {
    case NodeType.Script:
      return false;
    case NodeType.Category:
      return parseAllSubScriptIds(node).some((id) => selectedNodeIds.includes(id));
    default:
      throw new Error('Unknown node type');
  }
}

function getNewCheckedState(
  node: ILiquorTreeNode,
  selectedNodeIds: ReadonlyArray<string>,
): boolean {
  switch (node.data.type) {
    case NodeType.Script:
      return selectedNodeIds.some((id) => id === node.id);
    case NodeType.Category:
      return parseAllSubScriptIds(node).every((id) => selectedNodeIds.includes(id));
    default:
      throw new Error('Unknown node type');
  }
}

function parseAllSubScriptIds(categoryNode: ILiquorTreeNode): ReadonlyArray<string> {
  if (categoryNode.data.type !== NodeType.Category) {
    throw new Error('Not a category node');
  }
  if (!categoryNode.children) {
    return [];
  }
  return categoryNode
    .children
    .flatMap((child) => getNodeIds(child));
}

function getNodeIds(node: ILiquorTreeNode): ReadonlyArray<string> {
  switch (node.data.type) {
    case NodeType.Script:
      return [node.id];
    case NodeType.Category:
      return parseAllSubScriptIds(node);
    default:
      throw new Error('Unknown node type');
  }
}
