import { WatchSource, inject, watch } from 'vue';
import { InjectionKeys } from '@/presentation/injectionSymbols';
import { TreeRoot } from './TreeRoot/TreeRoot';
import { TreeNode } from './Node/TreeNode';
import { useCurrentTreeNodes } from './UseCurrentTreeNodes';
import { NodeStateChangedEvent } from './Node/State/StateAccess';

type NodeStateChangeEventCallback = (
  node: TreeNode,
  stateChange: NodeStateChangedEvent,
) => void;

export function useNodeStateChangeAggregator(treeWatcher: WatchSource<TreeRoot>) {
  const { nodes } = useCurrentTreeNodes(treeWatcher);
  const { events } = inject(InjectionKeys.useAutoUnsubscribedEvents)();

  const onNodeChangeCallbacks = new Array<NodeStateChangeEventCallback>();

  watch(() => nodes.value, (newNodes) => {
    events.unsubscribeAll();
    newNodes.flattenedNodes.forEach((node) => {
      events.register([
        node.state.changed.on((stateChange) => {
          onNodeChangeCallbacks.forEach((callback) => callback(node, stateChange));
        }),
      ]);
    });
  });

  return {
    onNodeStateChange: (
      callback: NodeStateChangeEventCallback,
    ) => onNodeChangeCallbacks.push(callback),
  };
}
