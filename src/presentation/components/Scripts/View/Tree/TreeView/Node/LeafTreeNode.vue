<template>
  <li
    class="node focusable"
    tabindex="-1"
    :class="{
      'keyboard-focus': hasKeyboardFocus,
    }"
    @click.stop="toggleCheckState"
    @focus="onNodeFocus"
  >
    <div class="node__layout">
      <div class="node__checkbox">
        <NodeCheckbox
          :node-id="nodeId"
          :tree-root="treeRoot"
        />
      </div>
      <div class="node__content content">
        <slot
          name="node-content"
          :node-metadata="currentNode.metadata"
        />
      </div>
    </div>
  </li>
</template>

<script lang="ts">
import { defineComponent, computed, toRef } from 'vue';
import { TreeRoot } from '../TreeRoot/TreeRoot';
import { useCurrentTreeNodes } from '../UseCurrentTreeNodes';
import { useNodeState } from './UseNodeState';
import { useKeyboardInteractionState } from './UseKeyboardInteractionState';
import { TreeNode } from './TreeNode';
import NodeCheckbox from './NodeCheckbox.vue';
import type { PropType } from 'vue';

export default defineComponent({
  components: {
    NodeCheckbox,
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
  },
  setup(props) {
    const { isKeyboardBeingUsed } = useKeyboardInteractionState();
    const { nodes } = useCurrentTreeNodes(toRef(props, 'treeRoot'));
    const currentNode = computed<TreeNode>(() => nodes.value.getNodeById(props.nodeId));
    const { state } = useNodeState(currentNode);

    const hasKeyboardFocus = computed<boolean>(() => {
      if (!isKeyboardBeingUsed.value) {
        return false;
      }
      return state.value.isFocused;
    });

    const onNodeFocus = () => {
      props.treeRoot.focus.setSingleFocus(currentNode.value);
    };

    function toggleCheckState() {
      currentNode.value.state.toggleCheck();
    }

    return {
      onNodeFocus,
      toggleCheckState,
      currentNode,
      hasKeyboardFocus,
    };
  },
});
</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;
@use "./../tree-colors" as *;

.node__layout {
  display: flex;
  align-items: center;
  flex: 1;

  .node__checkbox {
    flex-shrink: 0; // Always render the checkbox properly on small screens
  }
  .node__content {
    flex: 1; // Expands the node horizontally, allowing its content to utilize full width for child item alignment, such as icons and text.
    overflow: auto; // Prevents horizontal expansion of inner content (e.g., when a code block is shown)
  }
}

.focusable {
  outline: none; // We handle keyboard focus through own styling
}
.node {
  margin-bottom: 3px;
  margin-top: 3px;
  padding-bottom: 3px;
  padding-top: 3px;
  padding-right: 6px;
  cursor: pointer;
  box-sizing: border-box;

  &.keyboard-focus {
    background: $color-node-highlight-bg;
  }

  @include hover-or-touch {
    background: $color-node-highlight-bg;
  }

  .content {
    display: flex; // We could provide `block`, but `flex` is more versatile.
    color: $color-node-fg;
    padding-left: 9px;
    padding-right: 6px;
    text-decoration: none;
    user-select: none;

    font-size: 1.5em;
    line-height: 24px;
    /*
      Following is a workaround fixing overflow-y caused by line height being smaller than font.
      It should be removed once a proper line-height matching the font-size (not smaller than) is used.
    */
    $line-height-compensation: calc((1.5em - 24px) / 4);
    padding-top: $line-height-compensation;
    padding-bottom: $line-height-compensation;
    margin-top: calc(-1 * $line-height-compensation);
    margin-bottom: calc(-1 * $line-height-compensation);
  }
}
</style>
