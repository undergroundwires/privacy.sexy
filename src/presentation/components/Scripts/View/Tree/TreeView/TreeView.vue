<template>
  <div
    ref="treeContainerElement"
    class="tree"
  >
    <TreeRoot :tree-root="tree" :rendering-strategy="renderingStrategy">
      <template #default="slotProps">
        <slot name="node-content" v-bind="slotProps" />
      </template>
    </TreeRoot>
  </div>
</template>

<script lang="ts">
import {
  defineComponent, onMounted, watch,
  shallowRef, toRef, shallowReadonly,
  nextTick,
} from 'vue';
import { TreeRootManager } from './TreeRoot/TreeRootManager';
import TreeRoot from './TreeRoot/TreeRoot.vue';
import { TreeInputNodeData } from './Bindings/TreeInputNodeData';
import { TreeViewFilterEvent } from './Bindings/TreeInputFilterEvent';
import { useTreeQueryFilter } from './UseTreeQueryFilter';
import { useTreeKeyboardNavigation } from './UseTreeKeyboardNavigation';
import { useNodeStateChangeAggregator } from './UseNodeStateChangeAggregator';
import { useLeafNodeCheckedStateUpdater } from './UseLeafNodeCheckedStateUpdater';
import { TreeNodeStateChangedEmittedEvent } from './Bindings/TreeNodeStateChangedEmittedEvent';
import { useAutoUpdateParentCheckState } from './UseAutoUpdateParentCheckState';
import { useAutoUpdateChildrenCheckState } from './UseAutoUpdateChildrenCheckState';
import { useGradualNodeRendering, NodeRenderingControl } from './Rendering/UseGradualNodeRendering';
import type { PropType } from 'vue';

export default defineComponent({
  components: {
    TreeRoot,
  },
  props: {
    nodes: {
      type: Array as PropType<readonly TreeInputNodeData[]>,
      default: () => [],
    },
    latestFilterEvent: {
      type: Object as PropType<TreeViewFilterEvent | undefined>,
      default: () => undefined,
    },
    selectedLeafNodeIds: {
      type: Array as PropType<ReadonlyArray<string>>,
      default: () => [],
    },
  },
  emits: {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    nodeStateChanged: (node: TreeNodeStateChangedEmittedEvent) => true,
    /* eslint-enable @typescript-eslint/no-unused-vars */
  },
  setup(props, { emit }) {
    const treeContainerElement = shallowRef<HTMLElement | undefined>();

    const tree = new TreeRootManager();

    const treeRef = shallowReadonly(shallowRef(tree));

    useTreeKeyboardNavigation(treeRef, treeContainerElement);
    useTreeQueryFilter(toRef(props, 'latestFilterEvent'), treeRef);
    useLeafNodeCheckedStateUpdater(treeRef, toRef(props, 'selectedLeafNodeIds'));
    useAutoUpdateParentCheckState(treeRef);
    useAutoUpdateChildrenCheckState(treeRef);
    const nodeRenderer = useGradualNodeRendering(treeRef);

    const { onNodeStateChange } = useNodeStateChangeAggregator(treeRef);

    onNodeStateChange((change) => {
      emit('nodeStateChanged', {
        node: change.node,
        newState: change.newState,
        oldState: change.oldState,
      });
    });

    onMounted(() => {
      watch(() => props.nodes, async (nodes) => {
        await forceRerenderNodes(
          nodeRenderer,
          () => tree.collection.updateRootNodes(nodes),
        );
      }, { immediate: true });
    });

    return {
      treeContainerElement,
      renderingStrategy: nodeRenderer.renderingStrategy,
      tree,
    };
  },
});

/**
 * This function is used to manually trigger a re-render of the tree nodes.
 * In Vue, manually controlling the rendering process is typically an anti-pattern,
 * as Vue's reactivity system is designed to handle updates efficiently. However,
 * in this specific case, it's necessary to ensure the correct order of rendering operations.
 * This function first clears the rendering queue and the currently rendered nodes,
 * ensuring that UI elements relying on outdated node states are removed. This is needed
 * in scenarios where the collection is updated before the nodes, which can lead to errors
 * if nodes that no longer exist in the collection are still being rendered.
 * Using this function, we ensure a clean state before updating the nodes, aligning with
 * the updated collection.
 */
async function forceRerenderNodes(
  renderer: NodeRenderingControl,
  nodeUpdater: () => void,
) {
  renderer.clearRenderingStates();
  renderer.notifyRenderingUpdates();
  await nextTick();
  nodeUpdater();
}

</script>

<style scoped lang="scss">
@use "./tree-colors" as *;

.tree {
  background: $color-tree-bg;
  overflow: auto; // Prevents horizontal expansion of inner content (e.g., when a code block is shown)
  flex: 1; // Expands the node horizontally, allowing its content to utilize full width for child item alignment, such as icons and text.
}
</style>
