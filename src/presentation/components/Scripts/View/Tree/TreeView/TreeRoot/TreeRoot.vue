<template>
  <ul
    class="tree-root"
  >
    <HierarchicalTreeNode
      v-for="nodeId in renderedNodeIds"
      :key="nodeId"
      :node-id="nodeId"
      :tree-root="treeRoot"
      :rendering-strategy="renderingStrategy"
    >
      <template #node-content="slotProps">
        <slot v-bind="slotProps" />
      </template>
    </HierarchicalTreeNode>
  </ul>
</template>

<script lang="ts">
import {
  defineComponent, computed, toRef,
} from 'vue';
import HierarchicalTreeNode from '../Node/HierarchicalTreeNode.vue';
import { useCurrentTreeNodes } from '../UseCurrentTreeNodes';
import type { NodeRenderingStrategy } from '../Rendering/Scheduling/NodeRenderingStrategy';
import type { TreeRoot } from './TreeRoot';
import type { PropType } from 'vue';

export default defineComponent({
  components: {
    HierarchicalTreeNode,
  },
  props: {
    treeRoot: {
      type: Object as PropType<TreeRoot>,
      required: true,
    },
    renderingStrategy: {
      type: Object as PropType<NodeRenderingStrategy>,
      required: true,
    },
  },
  setup(props) {
    const { nodes } = useCurrentTreeNodes(toRef(props, 'treeRoot'));

    const renderedNodeIds = computed<string[]>(() => {
      return nodes
        .value
        .rootNodes
        .filter((node) => props.renderingStrategy.shouldRender(node))
        .map((node) => node.id);
    });

    return {
      renderedNodeIds,
    };
  },
});
</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

.tree-root {
  @include reset-ul;
}
</style>
