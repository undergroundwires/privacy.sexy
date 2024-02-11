import { ICategoryCollection } from '@/domain/ICategoryCollection';
import { NodeMetadata, NodeType } from '../NodeMetadata';
import { Reverter } from './Reverter';
import { ScriptReverter } from './ScriptReverter';
import { CategoryReverter } from './CategoryReverter';

export function getReverter(node: NodeMetadata, collection: ICategoryCollection): Reverter {
  switch (node.type) {
    case NodeType.Category:
      return new CategoryReverter(node.id, collection);
    case NodeType.Script:
      return new ScriptReverter(node.id);
    default:
      throw new Error('Unknown script type');
  }
}
