<template>
  <div
    ref="treeContainerElement"
    class="tree"
  >
    <TreeRoot :tree-root="tree" :rendering-strategy="nodeRenderingScheduler">
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
import { useGradualNodeRendering } from './Rendering/UseGradualNodeRendering';
import type { PropType } from 'vue';

export default defineComponent({
  components: {
    TreeRoot,
  },
  props: {
    initialNodes: {
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
    const nodeRenderingScheduler = useGradualNodeRendering(treeRef);

    const { onNodeStateChange } = useNodeStateChangeAggregator(treeRef);

    onNodeStateChange((change) => {
      emit('nodeStateChanged', {
        node: change.node,
        newState: change.newState,
        oldState: change.oldState,
      });
    });

    onMounted(() => {
      watch(() => props.initialNodes, (nodes) => {
        tree.collection.updateRootNodes(nodes);
      }, { immediate: true });
    });

    return {
      treeContainerElement,
      nodeRenderingScheduler,
      tree,
    };
  },
});
</script>

<style scoped lang="scss">
@use "./tree-colors" as *;

.tree {
  background: $color-tree-bg;
  overflow: auto; // Prevents horizontal expansion of inner content (e.g., when a code block is shown)
}
</style>
