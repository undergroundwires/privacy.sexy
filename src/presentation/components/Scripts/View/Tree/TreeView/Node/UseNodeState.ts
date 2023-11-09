import {
  WatchSource, shallowRef, watch,
} from 'vue';
import { injectKey } from '@/presentation/injectionSymbols';
import { ReadOnlyTreeNode } from './TreeNode';
import { TreeNodeStateDescriptor } from './State/StateDescriptor';

export function useNodeState(
  nodeWatcher: WatchSource<ReadOnlyTreeNode | undefined>,
) {
  const { events } = injectKey((keys) => keys.useAutoUnsubscribedEvents);

  const state = shallowRef<TreeNodeStateDescriptor>();

  watch(nodeWatcher, (node: ReadOnlyTreeNode) => {
    if (!node) {
      return;
    }
    state.value = node.state.current;
    events.unsubscribeAllAndRegister([
      node.state.changed.on((change) => {
        state.value = change.newState;
      }),
    ]);
  }, { immediate: true });

  return {
    state,
  };
}
