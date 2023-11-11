import {
  watch, shallowReadonly, shallowRef, type Ref,
} from 'vue';
import { injectKey } from '@/presentation/injectionSymbols';
import { TreeRoot } from './TreeRoot/TreeRoot';
import { QueryableNodes } from './TreeRoot/NodeCollection/Query/QueryableNodes';

export function useCurrentTreeNodes(treeRef: Readonly<Ref<TreeRoot>>) {
  const { events } = injectKey((keys) => keys.useAutoUnsubscribedEvents);

  const nodes = shallowRef<QueryableNodes>(treeRef.value.collection.nodes);

  watch(treeRef, (newTree) => {
    nodes.value = newTree.collection.nodes;
    events.unsubscribeAllAndRegister([
      newTree.collection.nodesUpdated.on((newNodes) => {
        nodes.value = newNodes;
      }),
    ]);
  }, { immediate: true });

  return {
    nodes: shallowReadonly(nodes),
  };
}
