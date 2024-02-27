import {
  watch, shallowRef, type Ref,
} from 'vue';
import { injectKey } from '@/presentation/injectionSymbols';
import type { IEventSubscription } from '@/infrastructure/Events/IEventSource';
import { useCurrentTreeNodes } from './UseCurrentTreeNodes';
import type { TreeNodeStateDescriptor } from './Node/State/StateDescriptor';
import type { TreeRoot } from './TreeRoot/TreeRoot';
import type { TreeNode } from './Node/TreeNode';

export type NodeStateChangeEventCallback = (args: NodeStateChangeEventArgs) => void;

export function useNodeStateChangeAggregator(
  treeRootRef: Readonly<Ref<TreeRoot>>,
  useTreeNodes = useCurrentTreeNodes,
) {
  const { nodes } = useTreeNodes(treeRootRef);
  const { events } = injectKey((keys) => keys.useAutoUnsubscribedEvents);

  const onNodeChangeCallback = shallowRef<NodeStateChangeEventCallback>();

  watch(
    [nodes, onNodeChangeCallback],
    ([newNodes, callback]) => {
      if (!callback) { // may not be registered yet
        return;
      }
      if (!newNodes || newNodes.flattenedNodes.length === 0) {
        events.unsubscribeAll();
        return;
      }
      const allNodes = newNodes.flattenedNodes;
      events.unsubscribeAllAndRegister(
        subscribeToNotifyOnFutureNodeChanges(allNodes, callback),
      );
      notifyCurrentNodeState(allNodes, callback);
    },
  );

  function onNodeStateChange(
    callback: NodeStateChangeEventCallback,
  ): void {
    if (!callback) {
      throw new Error('missing callback');
    }
    onNodeChangeCallback.value = callback;
  }

  return {
    onNodeStateChange,
  };
}

export interface NodeStateChangeEventArgs {
  readonly node: TreeNode;
  readonly newState: TreeNodeStateDescriptor;
  readonly oldState?: TreeNodeStateDescriptor;
}

function notifyCurrentNodeState(
  nodes: readonly TreeNode[],
  callback: NodeStateChangeEventCallback,
) {
  nodes.forEach((node) => {
    callback({
      node,
      newState: node.state.current,
    });
  });
}

function subscribeToNotifyOnFutureNodeChanges(
  nodes: readonly TreeNode[],
  callback: NodeStateChangeEventCallback,
): IEventSubscription[] {
  return nodes.map((node) => node.state.changed.on((stateChange) => {
    callback({
      node,
      oldState: stateChange.oldState,
      newState: stateChange.newState,
    });
  }));
}
