<template>
  <div class="wrapper" v-if="currentNode">
    <div
      class="expansible-node"
      @click="toggleCheck"
      :style="{
        'padding-left': `${currentNode.hierarchy.depthInTree * 24}px`,
      }">
      <div
        class="expand-collapse-arrow"
        :class="{
          expanded: expanded,
          'has-children': hasChildren,
        }"
        @click.stop="toggleExpand"
      />
      <LeafTreeNode
        :nodeId="nodeId"
        :treeRoot="treeRoot"
      >
        <template v-slot:node-content="slotProps">
          <slot name="node-content" v-bind="slotProps" />
        </template>
      </LeafTreeNode>
    </div>

    <transition name="children-transition">
      <ul
        v-if="hasChildren && expanded"
        class="children"
      >
        <HierarchicalTreeNode
          v-for="id in renderedNodeIds"
          :key="id"
          :nodeId="id"
          :treeRoot="treeRoot"
          :renderingStrategy="renderingStrategy"
        >
          <template v-slot:node-content="slotProps">
            <slot name="node-content" v-bind="slotProps" />
          </template>
        </HierarchicalTreeNode>
      </ul>
    </transition>
  </div>
</template>

<script lang="ts">
import {
  defineComponent, computed, PropType,
} from 'vue';
import { TreeRoot } from '../TreeRoot/TreeRoot';
import { useCurrentTreeNodes } from '../UseCurrentTreeNodes';
import { NodeRenderingStrategy } from '../Rendering/NodeRenderingStrategy';
import { useNodeState } from './UseNodeState';
import { TreeNode } from './TreeNode';
import LeafTreeNode from './LeafTreeNode.vue';

export default defineComponent({
  name: 'HierarchicalTreeNode', // Needed due to recursion
  components: {
    LeafTreeNode,
  },
  props: {
    nodeId: {
      type: String,
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
    const { nodes } = useCurrentTreeNodes(() => props.treeRoot);
    const currentNode = computed<TreeNode | undefined>(
      () => nodes.value?.getNodeById(props.nodeId),
    );

    const { state } = useNodeState(() => currentNode.value);
    const expanded = computed<boolean>(() => state.value?.isExpanded ?? false);

    const renderedNodeIds = computed<readonly string[]>(
      () => currentNode.value
        ?.hierarchy
        .children
        .filter((child) => props.renderingStrategy.shouldRender(child))
        .map((child) => child.id)
        ?? [],
    );

    function toggleExpand() {
      currentNode.value?.state.toggleExpand();
    }

    function toggleCheck() {
      currentNode.value?.state.toggleCheck();
    }

    const hasChildren = computed<boolean>(
      () => currentNode.value?.hierarchy.isBranchNode,
    );

    return {
      renderedNodeIds,
      expanded,
      toggleCheck,
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
  cursor: pointer;

  .children {
    @include reset-ul;
  }
}

.expansible-node {
  display: flex;
  flex-direction: row;
  align-items: center;
  @include hover-or-touch {
    background: $color-node-highlight-bg;
  }
  .expand-collapse-arrow {
    flex-shrink: 0;
    height: 30px;
    cursor: pointer;
    margin-left: 30px;
    width: 0;

    &:after {
      position: absolute;
      display: block;
      content: "";
    }

    &.has-children {
      margin-left: 0;
      width: 30px;
      position: relative;

      &:after {
        border: 1.5px solid $color-node-arrow;
        position: absolute;
        border-left: 0;
        border-top: 0;
        left: 9px;
        top: 50%;
        height: 9px;
        width: 9px;
        transform: rotate(-45deg) translateY(-50%) translateX(0);
        transition: transform .25s;
        transform-origin: center;
      }

      &.expanded:after {
        transform: rotate(45deg) translateY(-50%) translateX(-5px);
      }
    }
  }
}

@mixin left-fade-transition($name) {
  .#{$name}-enter-active,
  .#{$name}-leave-active {
    transition: opacity .3s, transform .3s;
    transform: translateX(0);
  }

  .#{$name}-enter,
  // Vue 2.X compatibility
  .#{$name}-enter-from,
  // Vue 3.X compatibility
  .#{$name}-leave-to {
    opacity: 0;
    transform: translateX(-2em);
  }
}
@include left-fade-transition('children-transition');
</style>
