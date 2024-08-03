import {
  type Ref, computed, shallowReadonly,
} from 'vue';
import type { ICategoryCollection } from '@/domain/Collection/ICategoryCollection';
import { injectKey } from '@/presentation/injectionSymbols';
import type { ExecutableId } from '@/domain/Executables/Identifiable';
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
  categoryCollection: ICategoryCollection,
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
