import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import { type NodeMetadata, NodeType } from '../NodeMetadata';
import { ScriptReverter } from './ScriptReverter';
import { CategoryReverter } from './CategoryReverter';
import type { Reverter } from './Reverter';

export function getReverter(
  node: NodeMetadata,
  collection: CategoryCollection,
): Reverter {
  switch (node.type) {
    case NodeType.Category:
      return new CategoryReverter(node.executableId, collection);
    case NodeType.Script:
      return new ScriptReverter(node.executableId);
    default:
      throw new Error('Unknown script type');
  }
}
