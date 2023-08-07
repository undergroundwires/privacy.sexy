import { ICategoryCollection } from '@/domain/ICategoryCollection';
import { INodeContent, NodeType } from '../INodeContent';
import { IReverter } from './IReverter';
import { ScriptReverter } from './ScriptReverter';
import { CategoryReverter } from './CategoryReverter';

export function getReverter(node: INodeContent, collection: ICategoryCollection): IReverter {
  switch (node.type) {
    case NodeType.Category:
      return new CategoryReverter(node.id, collection);
    case NodeType.Script:
      return new ScriptReverter(node.id);
    default:
      throw new Error('Unknown script type');
  }
}
