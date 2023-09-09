import {
  WatchSource, computed, shallowRef, triggerRef, watch,
} from 'vue';
import { ReadOnlyTreeNode } from '../Node/TreeNode';
import { useNodeStateChangeAggregator } from '../UseNodeStateChangeAggregator';
import { TreeRoot } from '../TreeRoot/TreeRoot';
import { useCurrentTreeNodes } from '../UseCurrentTreeNodes';
import { NodeRenderingStrategy } from './NodeRenderingStrategy';

/**
 * Renders tree nodes gradually to prevent UI freeze when loading large amounts of nodes.
 */
export function useGradualNodeRendering(
  treeWatcher: WatchSource<TreeRoot>,
): NodeRenderingStrategy {
  const nodesToRender = new Set<ReadOnlyTreeNode>();
  const nodesBeingRendered = shallowRef(new Set<ReadOnlyTreeNode>());
  let isFirstRender = true;
  let isRenderingInProgress = false;
  const renderingDelayInMs = 50;
  const initialBatchSize = 30;
  const subsequentBatchSize = 5;

  const { onNodeStateChange } = useNodeStateChangeAggregator(treeWatcher);
  const { nodes } = useCurrentTreeNodes(treeWatcher);

  const orderedNodes = computed<readonly ReadOnlyTreeNode[]>(() => nodes.value.flattenedNodes);

  watch(() => orderedNodes.value, (newNodes) => {
    newNodes.forEach((node) => updateNodeRenderQueue(node));
  }, { immediate: true });

  function updateNodeRenderQueue(node: ReadOnlyTreeNode) {
    if (node.state.current.isVisible
        && !nodesToRender.has(node)
        && !nodesBeingRendered.value.has(node)) {
      nodesToRender.add(node);
      if (!isRenderingInProgress) {
        scheduleRendering();
      }
    } else if (!node.state.current.isVisible) {
      if (nodesToRender.has(node)) {
        nodesToRender.delete(node);
      }
      if (nodesBeingRendered.value.has(node)) {
        nodesBeingRendered.value.delete(node);
        triggerRef(nodesBeingRendered);
      }
    }
  }

  onNodeStateChange((node, change) => {
    if (change.newState.isVisible === change.oldState.isVisible) {
      return;
    }
    updateNodeRenderQueue(node);
  });

  scheduleRendering();

  function scheduleRendering() {
    if (isFirstRender) {
      renderNodeBatch();
      isFirstRender = false;
    } else {
      const delayScheduler = new DelayScheduler(renderingDelayInMs);
      delayScheduler.schedule(renderNodeBatch);
    }
  }

  function renderNodeBatch() {
    if (nodesToRender.size === 0) {
      isRenderingInProgress = false;
      return;
    }
    isRenderingInProgress = true;
    const batchSize = isFirstRender ? initialBatchSize : subsequentBatchSize;
    const sortedNodes = Array.from(nodesToRender).sort(
      (a, b) => orderedNodes.value.indexOf(a) - orderedNodes.value.indexOf(b),
    );
    const currentBatch = sortedNodes.slice(0, batchSize);
    currentBatch.forEach((node) => {
      nodesToRender.delete(node);
      nodesBeingRendered.value.add(node);
    });
    triggerRef(nodesBeingRendered);
    if (nodesToRender.size > 0) {
      scheduleRendering();
    }
  }

  function shouldNodeBeRendered(node: ReadOnlyTreeNode) {
    return nodesBeingRendered.value.has(node);
  }

  return {
    shouldRender: shouldNodeBeRendered,
  };
}

class DelayScheduler {
  private timeoutId: ReturnType<typeof setTimeout> = null;

  constructor(private delay: number) {}

  schedule(callback: () => void) {
    this.clear();
    this.timeoutId = setTimeout(callback, this.delay);
  }

  clear() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
