<template>
  <div
    ref="nodeElement"
    class="clickable-node focusable-node"
    tabindex="-1"
    :data-tree-node-id="nodeId"
    :class="{
      'keyboard-focus': hasKeyboardFocus,
    }"
    @click.stop="toggleCheckState"
    @focus="onNodeFocus"
  >
    <slot />
  </div>
</template>

<script lang="ts">
import {
  defineComponent, computed, nextTick, ref, toRef, watch,
} from 'vue';
import { useCurrentTreeNodes } from '../UseCurrentTreeNodes';
import { useNodeState } from './UseNodeState';
import { useKeyboardInteractionState } from './UseKeyboardInteractionState';
import type { TreeRoot } from '../TreeRoot/TreeRoot';
import type { TreeNode, TreeNodeId } from './TreeNode';
import type { PropType } from 'vue';

export default defineComponent({
  props: {
    nodeId: {
      type: String as PropType<TreeNodeId>,
      required: true,
    },
    treeRoot: {
      type: Object as PropType<TreeRoot>,
      required: true,
    },
  },
  setup(props) {
    const { isKeyboardBeingUsed } = useKeyboardInteractionState();
    const { nodes } = useCurrentTreeNodes(toRef(props, 'treeRoot'));
    const currentNode = computed<TreeNode>(() => nodes.value.getNodeById(props.nodeId));
    const { state } = useNodeState(currentNode);
    const nodeElement = ref<HTMLElement>();

    const hasKeyboardFocus = computed<boolean>(() => {
      if (!isKeyboardBeingUsed.value) {
        return false;
      }
      return state.value.isFocused;
    });

    const onNodeFocus = () => {
      props.treeRoot.focus.setSingleFocus(currentNode.value);
    };

    watch(
      () => state.value.isFocused,
      (isFocused) => {
        if (!isFocused) {
          return;
        }
        nextTick(() => nodeElement.value?.focus());
      },
      { immediate: true },
    );

    function toggleCheckState() {
      currentNode.value.state.toggleCheck();
    }

    return {
      onNodeFocus,
      toggleCheckState,
      currentNode,
      hasKeyboardFocus,
      nodeElement,
    };
  },
});
</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;
@use "./../tree-colors" as *;

.clickable-node {
  @include clickable;
  @include hover-or-touch {
    background: $color-node-highlight-bg;
  }
}

.focusable-node {
  outline: none; // We handle keyboard focus through own styling
  &.keyboard-focus {
    background: $color-node-highlight-bg;
  }
}
</style>
