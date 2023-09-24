import {
  WatchSource, computed, shallowRef, triggerRef, watch,
} from 'vue';
import { ReadOnlyTreeNode } from '../Node/TreeNode';
import { useNodeStateChangeAggregator } from '../UseNodeStateChangeAggregator';
import { TreeRoot } from '../TreeRoot/TreeRoot';
import { useCurrentTreeNodes } from '../UseCurrentTreeNodes';
import { NodeRenderingStrategy } from './NodeRenderingStrategy';
import { DelayScheduler } from './DelayScheduler';
import { TimeoutDelayScheduler } from './TimeoutDelayScheduler';

/**
 * Renders tree nodes gradually to prevent UI freeze when loading large amounts of nodes.
 */
export function useGradualNodeRendering(
  treeWatcher: WatchSource<TreeRoot>,
  useChangeAggregator = useNodeStateChangeAggregator,
  useTreeNodes = useCurrentTreeNodes,
  scheduler: DelayScheduler = new TimeoutDelayScheduler(),
  initialBatchSize = 30,
  subsequentBatchSize = 5,
): NodeRenderingStrategy {
  const nodesToRender = new Set<ReadOnlyTreeNode>();
  const nodesBeingRendered = shallowRef(new Set<ReadOnlyTreeNode>());
  let isRenderingInProgress = false;
  const renderingDelayInMs = 50;

  const { onNodeStateChange } = useChangeAggregator(treeWatcher);
  const { nodes } = useTreeNodes(treeWatcher);

  const orderedNodes = computed<readonly ReadOnlyTreeNode[]>(() => nodes.value.flattenedNodes);

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
        triggerRef(nodesBeingRendered);
      }
    }
  }

  watch(() => orderedNodes.value, (newNodes) => {
    nodesToRender.clear();
    nodesBeingRendered.value.clear();
    if (!newNodes?.length) {
      triggerRef(nodesBeingRendered);
      return;
    }
    newNodes
      .filter((node) => node.state.current.isVisible)
      .forEach((node) => nodesToRender.add(node));
    beginRendering();
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
    const sortedNodes = Array.from(nodesToRender).sort(
      (a, b) => orderedNodes.value.indexOf(a) - orderedNodes.value.indexOf(b),
    );
    const currentBatch = sortedNodes.slice(0, batchSize);
    if (currentBatch.length === 0) {
      return;
    }
    currentBatch.forEach((node) => {
      nodesToRender.delete(node);
      nodesBeingRendered.value.add(node);
    });
    triggerRef(nodesBeingRendered);
    scheduler.scheduleNext(
      () => renderNextBatch(subsequentBatchSize),
      renderingDelayInMs,
    );
  }

  function shouldNodeBeRendered(node: ReadOnlyTreeNode): boolean {
    return nodesBeingRendered.value.has(node);
  }

  return {
    shouldRender: shouldNodeBeRendered,
  };
}
