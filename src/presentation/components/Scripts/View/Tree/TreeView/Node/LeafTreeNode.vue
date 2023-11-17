<template>
  <li
    class="wrapper"
    @click.stop="toggleCheckState"
  >
    <div
      class="node focusable"
      :class="{
        'keyboard-focus': hasKeyboardFocus,
      }"
      tabindex="-1"
      @focus="onNodeFocus"
    >
      <div
        class="checkbox"
        :class="{
          checked: checked,
          indeterminate: indeterminate,
        }"
      />

      <div class="content">
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
import { TreeNodeCheckState } from './State/CheckState';
import type { PropType } from 'vue';

export default defineComponent({
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
    const currentNode = computed<TreeNode>(
      () => nodes.value.getNodeById(props.nodeId),
    );
    const { state } = useNodeState(currentNode);

    const hasFocus = computed<boolean>(() => state.value.isFocused);
    const checked = computed<boolean>(() => state.value.checkState === TreeNodeCheckState.Checked);
    const indeterminate = computed<boolean>(
      () => state.value.checkState === TreeNodeCheckState.Indeterminate,
    );

    const hasKeyboardFocus = computed<boolean>(() => {
      if (!isKeyboardBeingUsed.value) {
        return false;
      }
      return hasFocus.value;
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
      indeterminate,
      checked,
      currentNode,
      hasKeyboardFocus,
    };
  },
});
</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;
@use "./../tree-colors" as *;

.wrapper {
  flex: 1;
  padding-bottom: 3px;
  padding-top: 3px;
  .focusable {
    outline: none; // We handle keyboard focus through own styling
  }
  .node {
    display: flex;
    align-items: center;
    padding-bottom: 3px;
    padding-top: 3px;
    padding-right: 6px;
    cursor: pointer;
    width: 100%;
    box-sizing: border-box;

    &.keyboard-focus {
      background: $color-node-highlight-bg;
    }

    @include hover-or-touch {
      background: $color-node-highlight-bg;
    }

    .checkbox {
      flex-shrink: 0;
      position: relative;
      width: 30px;
      height: 30px;
      box-sizing: border-box;
      border: 1px solid $color-node-checkbox-border-unchecked;
      border-radius: 2px;
      transition: border-color .25s, background-color .25s;
      background: $color-node-checkbox-bg-unchecked;

      &:after {
        position: absolute;
        display: block;
        content: "";
      }

      &.indeterminate {
        border-color: $color-node-checkbox-border-unchecked;

        &:after {
          background-color: $color-node-checkbox-border-indeterminate;
          top: 50%;
          left: 20%;
          right: 20%;
          height: 2px;
        }
      }

      &.checked {
        background: $color-node-checkbox-bg-checked;
        border-color: $color-node-checkbox-border-checked;

        &:after {
          box-sizing: content-box;
          border: 1.5px solid $color-node-checkbox-tick-checked;
          /* probably width would be rounded in most cases */
          border-left: 0;
          border-top: 0;
          left: 9px;
          top: 3px;
          height: 15px;
          width: 8px;
          transform: rotate(45deg) scaleY(1);
          transition: transform .25s;
          transform-origin: center;
        }
      }
    }

    .content {
      padding-left: 9px;
      padding-right: 6px;
      flex-grow: 2;
      text-decoration: none;
      color: $color-node-fg;
      line-height: 24px;
      user-select: none;
      font-size: 1.5em;
    }
  }
}
</style>
