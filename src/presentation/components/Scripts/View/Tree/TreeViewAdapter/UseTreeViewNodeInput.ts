import {
  WatchSource, computed,
  ref, watch,
} from 'vue';
import { ICategoryCollection } from '@/domain/ICategoryCollection';
import { injectKey } from '@/presentation/injectionSymbols';
import { TreeInputNodeData } from '../TreeView/Bindings/TreeInputNodeData';
import { NodeMetadata } from '../NodeContent/NodeMetadata';
import { convertToNodeInput } from './TreeNodeMetadataConverter';
import { parseSingleCategory, parseAllCategories } from './CategoryNodeMetadataConverter';

export function useTreeViewNodeInput(
  categoryIdWatcher: WatchSource<number | undefined>,
  parser: CategoryNodeParser = {
    parseSingle: parseSingleCategory,
    parseAll: parseAllCategories,
  },
  nodeConverter = convertToNodeInput,
) {
  const { currentState } = injectKey((keys) => keys.useCollectionState);

  const categoryId = ref<number | undefined>();

  watch(categoryIdWatcher, (newCategoryId) => {
    categoryId.value = newCategoryId;
  }, { immediate: true });

  const nodes = computed<readonly TreeInputNodeData[]>(() => {
    const nodeMetadataList = parseNodes(categoryId.value, currentState.value.collection, parser);
    const nodeInputs = nodeMetadataList.map((node) => nodeConverter(node));
    return nodeInputs;
  });

  return {
    treeViewInputNodes: nodes,
  };
}

function parseNodes(
  categoryId: number | undefined,
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
