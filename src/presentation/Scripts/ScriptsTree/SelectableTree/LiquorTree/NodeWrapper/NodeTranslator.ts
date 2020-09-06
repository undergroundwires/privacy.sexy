import { ILiquorTreeNewNode, ILiquorTreeExistingNode } from 'liquor-tree';
import { INode } from './../../Node/INode';

// Functions to translate INode to LiqourTree models and vice versa for anti-corruption

export function convertExistingToNode(liquorTreeNode: ILiquorTreeExistingNode): INode {
    if (!liquorTreeNode) { throw new Error('liquorTreeNode is undefined'); }
    return {
        id: liquorTreeNode.id,
        type: liquorTreeNode.data.type,
        text: liquorTreeNode.data.text,
        // selected: liquorTreeNode.states && liquorTreeNode.states.checked,
        children: convertChildren(liquorTreeNode.children, convertExistingToNode),
        documentationUrls: liquorTreeNode.data.documentationUrls,
        isReversible : liquorTreeNode.data.isReversible,
    };
}

export function toNewLiquorTreeNode(node: INode): ILiquorTreeNewNode {
    if (!node) { throw new Error('node is undefined'); }
    return {
        id: node.id,
        text: node.text,
        state: {
            checked: false,
            indeterminate: false,
        },
        children: convertChildren(node.children, toNewLiquorTreeNode),
        data: {
            documentationUrls: node.documentationUrls,
            isReversible: node.isReversible,
            type: node.type,
        },
    };
}

function convertChildren<TOldNode, TNewNode>(
    oldChildren: readonly TOldNode[],
    callback: (value: TOldNode) => TNewNode): TNewNode[] {
    if (!oldChildren || oldChildren.length === 0) {
        return [];
    }
    return oldChildren.map((childNode) => callback(childNode));
}
