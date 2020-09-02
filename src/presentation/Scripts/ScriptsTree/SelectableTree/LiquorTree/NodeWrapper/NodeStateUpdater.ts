import { ILiquorTreeNode } from 'liquor-tree';
import { NodeType } from './../../Node/INode';

export function getNewCheckedState(
    oldNode: ILiquorTreeNode,
    selectedNodeIds: ReadonlyArray<string>): boolean {
    switch (oldNode.data.type) {
        case NodeType.Script:
            return selectedNodeIds.some((id) => id === oldNode.id);
        case NodeType.Category:
            return parseAllSubScriptIds(oldNode).every((id) => selectedNodeIds.includes(id));
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
            return [ node.id ];
        case NodeType.Category:
            return parseAllSubScriptIds(node);
        default:
            throw new Error('Unknown node type');
    }
}
