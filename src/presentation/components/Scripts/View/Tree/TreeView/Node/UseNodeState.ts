import {
  type Ref, shallowRef, watch, shallowReadonly,
} from 'vue';
import { injectKey } from '@/presentation/injectionSymbols';
import type { ReadOnlyTreeNode } from './TreeNode';
import type { TreeNodeStateDescriptor } from './State/StateDescriptor';

export function useNodeState(
  nodeRef: Readonly<Ref<ReadOnlyTreeNode>>,
) {
  const { events } = injectKey((keys) => keys.useAutoUnsubscribedEvents);

  const state = shallowRef<TreeNodeStateDescriptor>(nodeRef.value.state.current);

  watch(nodeRef, (node: ReadOnlyTreeNode) => {
    state.value = node.state.current;
    events.unsubscribeAllAndRegister([
      node.state.changed.on((change) => {
        state.value = change.newState;
      }),
    ]);
  }, { immediate: true });

  return {
    state: shallowReadonly(state),
  };
}
