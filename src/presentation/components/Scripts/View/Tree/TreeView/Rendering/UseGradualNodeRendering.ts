import {
  type Ref, shallowRef, triggerRef, watch,
} from 'vue';
import { useNodeStateChangeAggregator } from '../UseNodeStateChangeAggregator';
import { useCurrentTreeNodes } from '../UseCurrentTreeNodes';
import { TimeoutDelayScheduler } from './Scheduling/TimeoutDelayScheduler';
import { CollapsedParentOrderer } from './Ordering/CollapsedParentOrderer';
import type { ReadOnlyTreeNode } from '../Node/TreeNode';
import type { TreeRoot } from '../TreeRoot/TreeRoot';
import type { QueryableNodes } from '../TreeRoot/NodeCollection/Query/QueryableNodes';
import type { NodeRenderingStrategy } from './Scheduling/NodeRenderingStrategy';
import type { DelayScheduler } from './DelayScheduler';
import type { RenderQueueOrderer } from './Ordering/RenderQueueOrderer';

export interface NodeRenderingControl {
  readonly renderingStrategy: NodeRenderingStrategy;
  clearRenderingStates(): void;
  notifyRenderingUpdates(): void;
}

/**
 * Renders tree nodes gradually to prevent UI freeze when loading large amounts of nodes.
 */
export function useGradualNodeRendering(
  treeRootRef: Readonly<Ref<TreeRoot>>,
  useChangeAggregator = useNodeStateChangeAggregator,
  useTreeNodes = useCurrentTreeNodes,
  scheduler: DelayScheduler = new TimeoutDelayScheduler(),
  initialBatchSize = 30,
  subsequentBatchSize = 5,
  orderer: RenderQueueOrderer = new CollapsedParentOrderer(),
): NodeRenderingControl {
  const nodesToRender = new Set<ReadOnlyTreeNode>();
  const nodesBeingRendered = shallowRef(new Set<ReadOnlyTreeNode>());
  let isRenderingInProgress = false;
  const renderingDelayInMs = 50;

  const { onNodeStateChange } = useChangeAggregator(treeRootRef);
  const { nodes } = useTreeNodes(treeRootRef);

  function notifyRenderingUpdates() {
    triggerRef(nodesBeingRendered);
  }

  function updateNodeRenderQueue(node: ReadOnlyTreeNode, isVisible: boolean) {
    if (isVisible
        && !nodesToRender.has(node)
        && !nodesBeingRendered.value.has(node)) {
      nodesToRender.add(node);
      beginRendering();
    } else if (!isVisible) {
      if (nodesToRender.has(node)) {
        nodesToRender.delete(node);
      }
      if (nodesBeingRendered.value.has(node)) {
        nodesBeingRendered.value.delete(node);
        notifyRenderingUpdates();
      }
    }
  }

  function clearRenderingStates() {
    nodesToRender.clear();
    nodesBeingRendered.value.clear();
  }

  function initializeAndRenderNodes(newNodes: QueryableNodes) {
    clearRenderingStates();
    if (!newNodes || newNodes.flattenedNodes.length === 0) {
      notifyRenderingUpdates();
      return;
    }
    newNodes
      .flattenedNodes
      .filter((node) => node.state.current.isVisible)
      .forEach((node) => nodesToRender.add(node));
    beginRendering();
  }

  watch(nodes, (newNodes) => {
    initializeAndRenderNodes(newNodes);
  }, { immediate: true });

  onNodeStateChange((change) => {
    if (change.newState.isVisible === change.oldState?.isVisible) {
      return;
    }
    updateNodeRenderQueue(change.node, change.newState.isVisible);
  });

  function beginRendering() {
    if (isRenderingInProgress) {
      return;
    }
    renderNextBatch(initialBatchSize);
  }

  function renderNextBatch(batchSize: number) {
    if (nodesToRender.size === 0) {
      isRenderingInProgress = false;
      return;
    }
    isRenderingInProgress = true;
    const orderedNodes = orderer.orderNodes(nodesToRender);
    const currentBatch = orderedNodes.slice(0, batchSize);
    if (currentBatch.length === 0) {
      return;
    }
    currentBatch.forEach((node) => {
      nodesToRender.delete(node);
      nodesBeingRendered.value.add(node);
    });
    notifyRenderingUpdates();
    scheduler.scheduleNext(
      () => renderNextBatch(subsequentBatchSize),
      renderingDelayInMs,
    );
  }

  function shouldNodeBeRendered(node: ReadOnlyTreeNode): boolean {
    return nodesBeingRendered.value.has(node);
  }

  return {
    renderingStrategy: {
      shouldRender: shouldNodeBeRendered,
    },
    clearRenderingStates,
    notifyRenderingUpdates,
  };
}
