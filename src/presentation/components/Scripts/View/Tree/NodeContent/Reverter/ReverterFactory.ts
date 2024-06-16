import type { ICategoryCollection } from '@/domain/Collection/ICategoryCollection';
import { type NodeMetadata, NodeType } from '../NodeMetadata';
import { ScriptReverter } from './ScriptReverter';
import { CategoryReverter } from './CategoryReverter';
import type { Reverter } from './Reverter';

export function getReverter(
  node: NodeMetadata,
  collection: ICategoryCollection,
): Reverter {
  switch (node.type) {
    case NodeType.Category:
      return new CategoryReverter(node.id, collection);
    case NodeType.Script:
      return new ScriptReverter(node.id);
    default:
      throw new Error('Unknown script type');
  }
}
