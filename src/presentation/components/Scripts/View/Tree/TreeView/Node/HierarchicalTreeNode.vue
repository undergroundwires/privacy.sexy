<template>
  <div class="wrapper">
    <InteractableNode
      class="expansible-node"
      :style="{
        'padding-left': `${currentNode.hierarchy.depthInTree * 24}px`,
      }"
      :node-id="nodeId"
      :tree-root="treeRoot"
    >
      <div
        class="expand-collapse-caret"
        :class="{
          expanded: isExpanded,
          'has-children': hasChildren,
        }"
        @click.stop="toggleExpand"
      />
      <div class="leaf-node">
        <LeafTreeNode
          :node-id="nodeId"
          :tree-root="treeRoot"
        >
          <template #node-content="slotProps">
            <slot name="node-content" v-bind="slotProps" />
          </template>
        </LeafTreeNode>
      </div>
    </InteractableNode>
    <ExpandCollapseTransition>
      <ul
        v-if="hasChildren && isExpanded"
        class="children"
      >
        <HierarchicalTreeNode
          v-for="id in renderedNodeIds"
          :key="id"
          :node-id="id"
          :tree-root="treeRoot"
          :rendering-strategy="renderingStrategy"
        >
          <template #node-content="slotProps">
            <slot name="node-content" v-bind="slotProps" />
          </template>
        </HierarchicalTreeNode>
      </ul>
    </ExpandCollapseTransition>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, toRef } from 'vue';
import ExpandCollapseTransition from '@/presentation/components/Shared/ExpandCollapse/ExpandCollapseTransition.vue';
import { useCurrentTreeNodes } from '../UseCurrentTreeNodes';
import { useNodeState } from './UseNodeState';
import LeafTreeNode from './LeafTreeNode.vue';
import InteractableNode from './InteractableNode.vue';
import type { TreeRoot } from '../TreeRoot/TreeRoot';
import type { TreeNode, TreeNodeId } from './TreeNode';
import type { NodeRenderingStrategy } from '../Rendering/Scheduling/NodeRenderingStrategy';
import type { PropType } from 'vue';

export default defineComponent({
  name: 'HierarchicalTreeNode', // Needed due to recursion
  components: {
    LeafTreeNode,
    InteractableNode,
    ExpandCollapseTransition,
  },
  props: {
    nodeId: {
      type: String as PropType<TreeNodeId>,
      required: true,
    },
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
    const currentNode = computed<TreeNode>(
      () => nodes.value.getNodeById(props.nodeId),
    );

    const { state } = useNodeState(currentNode);
    const isExpanded = computed<boolean>(() => state.value.isExpanded);

    const renderedNodeIds = computed<readonly string[]>(
      () => currentNode.value
        .hierarchy
        .children
        .filter((child) => props.renderingStrategy.shouldRender(child))
        .map((child) => child.id),
    );

    function toggleExpand() {
      currentNode.value.state.toggleExpand();
    }

    const hasChildren = computed<boolean>(
      () => currentNode.value.hierarchy.isBranchNode,
    );

    return {
      renderedNodeIds,
      isExpanded,
      toggleExpand,
      currentNode,
      hasChildren,
    };
  },
});
</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;
@use "./../tree-colors" as *;

.wrapper {
  display: flex;
  flex-direction: column;

  .children {
    @include reset-ul;
  }
}

.expansible-node {
  display: flex;
  flex-direction: row;

  align-items: center;

  .leaf-node {
    flex: 1; // Expands the node horizontally, allowing its content to utilize full width for child item alignment, such as icons and text.
    overflow: auto; // Prevents horizontal expansion of inner content (e.g., when a code block is shown)
  }

  .expand-collapse-caret {
    $caret-size: 24px;
    $padding-right: $spacing-absolute-small;

    flex-shrink: 0;
    height: $caret-size;
    margin-left: $caret-size + $padding-right;
    width: 0;

    @include clickable;

    &:after {
      position: absolute;
      display: block;
      content: "";
    }

    &.has-children {
      margin-left: 0;
      width: $caret-size + $padding-right;
      position: relative;

      $caret-dimension: $caret-size * 0.375;
      $caret-stroke-width: 1.5px;
      &:after {
        border: $caret-stroke-width solid $color-node-arrow;
        position: absolute;
        border-left: 0;
        border-top: 0;
        left: $caret-dimension;
        top: 50%;
        height: $caret-dimension;
        width: $caret-dimension;
        transform:
          rotate(-45deg)
          translateY(-50%)
          translateX($caret-dimension * 0.2);
        transition: transform .25s;
        transform-origin: center;
      }
      &.expanded:after {
        transform:
          rotate(45deg)
          translateY(-50%)
          translateX($caret-dimension * -0.5);
      }
    }
  }
}
</style>
