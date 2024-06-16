import {
  type Ref, computed, shallowReadonly,
} from 'vue';
<<<<<<< HEAD
import type { ICategoryCollection } from '@/domain/Collection/ICategoryCollection';
import { injectKey } from '@/presentation/injectionSymbols';
import type { ExecutableId } from '@/domain/Executables/Identifiable/Identifiable';
=======
import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import { injectKey } from '@/presentation/injectionSymbols';
import type { ExecutableId } from '@/domain/Executables/ExecutableKey/ExecutableKey';
>>>>>>> cbea6fa3 (Add unique script/category IDs $49, $59, $262, $126)
import { parseSingleCategory, parseAllCategories } from './CategoryNodeMetadataConverter';
import { convertToNodeInput } from './TreeNodeMetadataConverter';
import type { TreeInputNodeData } from '../TreeView/Bindings/TreeInputNodeData';
import type { NodeMetadata } from '../NodeContent/NodeMetadata';

export function useTreeViewNodeInput(
  categoryIdRef: Readonly<Ref<ExecutableId | undefined>>,
  parser: CategoryNodeParser = {
    parseSingle: parseSingleCategory,
    parseAll: parseAllCategories,
  },
  nodeConverter = convertToNodeInput,
) {
  const { currentState } = injectKey((keys) => keys.useCollectionState);

  const nodes = computed<readonly TreeInputNodeData[]>(() => {
    const nodeMetadataList = parseNodes(categoryIdRef.value, currentState.value.collection, parser);
    const nodeInputs = nodeMetadataList.map((node) => nodeConverter(node));
    return nodeInputs;
  });

  return {
    treeViewInputNodes: shallowReadonly(nodes),
  };
}

function parseNodes(
  categoryId: ExecutableId | undefined,
<<<<<<< HEAD
  categoryCollection: ICategoryCollection,
=======
  categoryCollection: CategoryCollection,
>>>>>>> cbea6fa3 (Add unique script/category IDs $49, $59, $262, $126)
  parser: CategoryNodeParser,
): NodeMetadata[] {
  if (categoryId !== undefined) {
    return parser.parseSingle(categoryId, categoryCollection);
  }
  return parser.parseAll(categoryCollection);
}

export interface CategoryNodeParser {
  readonly parseSingle: typeof parseSingleCategory;
  readonly parseAll: typeof parseAllCategories;
}
