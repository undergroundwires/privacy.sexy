import {
  WatchSource, inject, watch, ref,
} from 'vue';
import { InjectionKeys } from '@/presentation/injectionSymbols';
import { IEventSubscription } from '@/infrastructure/Events/IEventSource';
import { TreeRoot } from './TreeRoot/TreeRoot';
import { TreeNode } from './Node/TreeNode';
import { useCurrentTreeNodes } from './UseCurrentTreeNodes';
import { TreeNodeStateDescriptor } from './Node/State/StateDescriptor';

export type NodeStateChangeEventCallback = (args: NodeStateChangeEventArgs) => void;

export function useNodeStateChangeAggregator(
  treeWatcher: WatchSource<TreeRoot>,
  useTreeNodes = useCurrentTreeNodes,
) {
  const { nodes } = useTreeNodes(treeWatcher);
  const { events } = inject(InjectionKeys.useAutoUnsubscribedEvents)();

  const onNodeChangeCallback = ref<NodeStateChangeEventCallback>();

  watch([
    () => nodes.value,
    () => onNodeChangeCallback.value,
  ], ([newNodes, callback]) => {
    if (!callback) { // might not be registered yet
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
  });

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
