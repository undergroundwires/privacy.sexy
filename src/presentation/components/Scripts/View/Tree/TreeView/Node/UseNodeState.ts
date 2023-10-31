import {
  WatchSource, inject, shallowRef, watch,
} from 'vue';
import { InjectionKeys } from '@/presentation/injectionSymbols';
import { ReadOnlyTreeNode } from './TreeNode';
import { TreeNodeStateDescriptor } from './State/StateDescriptor';

export function useNodeState(
  nodeWatcher: WatchSource<ReadOnlyTreeNode | undefined>,
) {
  const { events } = inject(InjectionKeys.useAutoUnsubscribedEvents)();

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
