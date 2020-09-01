import { INode, NodeType } from '../INode';
import { IReverter } from './IReverter';
import { ScriptReverter } from './ScriptReverter';
import { IApplication } from '@/domain/IApplication';
import { CategoryReverter } from './CategoryReverter';

export function getReverter(node: INode, app: IApplication): IReverter {
    switch (node.type) {
        case NodeType.Category:
            return new CategoryReverter(node.id, app);
        case NodeType.Script:
            return new ScriptReverter(node.id);
        default:
            throw new Error('Unknown script type');
    }
}
