import {
  WatchSource, watch, shallowReadonly, shallowRef,
} from 'vue';
import { injectKey } from '@/presentation/injectionSymbols';
import { TreeRoot } from './TreeRoot/TreeRoot';
import { QueryableNodes } from './TreeRoot/NodeCollection/Query/QueryableNodes';

export function useCurrentTreeNodes(treeWatcher: WatchSource<TreeRoot>) {
  const { events } = injectKey((keys) => keys.useAutoUnsubscribedEvents);

  const tree = shallowRef<TreeRoot | undefined>();
  const nodes = shallowRef<QueryableNodes | undefined>();

  watch(treeWatcher, (newTree) => {
    tree.value = newTree;
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
