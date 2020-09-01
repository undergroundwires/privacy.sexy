import { ILiquorTreeExistingNode, ILiquorTreeNewNode, ILiquorTreeNode } from 'liquor-tree';
import { NodeType } from './../Node/INode';

export function updateNodesCheckedState(
    oldNodes: ReadonlyArray<ILiquorTreeExistingNode>,
    selectedNodeIds: ReadonlyArray<string>): ReadonlyArray<ILiquorTreeNewNode> {
    const result = new Array<ILiquorTreeNewNode>();
    for (const oldNode of oldNodes) {
        const newState = oldNode.states;
        newState.checked = getNewCheckedState(oldNode, selectedNodeIds);
        const newNode: ILiquorTreeNewNode = {
            id: oldNode.id,
            text: oldNode.data.text,
            data: {
                type: oldNode.data.type,
                documentationUrls: oldNode.data.documentationUrls,
                isReversible: oldNode.data.isReversible,
            },
            children: !oldNode.children ? [] : updateNodesCheckedState(oldNode.children, selectedNodeIds),
            state: newState,
        };
        result.push(newNode);
    }
    return result;
}

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
    const ids = new Array<string>();
    for (const child of categoryNode.children) {
        addNodeIds(child, ids);
    }
    return ids;
}

function addNodeIds(node: ILiquorTreeNode, ids: string[]) {
    switch (node.data.type) {
        case NodeType.Script:
            ids.push(node.id);
            break;
        case NodeType.Category:
            const subCategoryIds = parseAllSubScriptIds(node);
            ids.push(...subCategoryIds);
            break;
        default:
            throw new Error('Unknown node type');
    }
}
