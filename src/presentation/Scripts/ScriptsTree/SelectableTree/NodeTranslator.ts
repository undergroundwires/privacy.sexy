import { ILiquorTreeNewNode, ILiquorTreeExistingNode } from 'liquor-tree';
import { INode } from './INode';

// Functions to translate INode to LiqourTree models and vice versa for anti-corruption

export function convertExistingToNode(liquorTreeNode: ILiquorTreeExistingNode): INode {
    if (!liquorTreeNode) { throw new Error('liquorTreeNode is undefined'); }
    return {
        id: liquorTreeNode.id,
        text: liquorTreeNode.data.text,
        // selected: liquorTreeNode.states && liquorTreeNode.states.checked,
        children: (!liquorTreeNode.children || liquorTreeNode.children.length === 0)
         ? [] : liquorTreeNode.children.map((childNode) => convertExistingToNode(childNode)),
        documentationUrls: liquorTreeNode.data.documentationUrls,
    };
}

export function toNewLiquorTreeNode(node: INode): ILiquorTreeNewNode {
    if (!node) { throw new Error('node is undefined'); }
    return {
        id: node.id,
        text: node.text,
        state: {
            checked: false,
        },
        children: (!node.children || node.children.length === 0) ? [] :
         node.children.map((childNode) => toNewLiquorTreeNode(childNode)),
        data: {
            documentationUrls: node.documentationUrls,
        },
    };
}
