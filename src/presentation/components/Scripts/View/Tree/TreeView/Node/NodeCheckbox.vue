<template>
  <div
    class="checkbox"
    :class="{
      checked: checked,
      indeterminate: indeterminate,
    }"
  />
</template>

<script lang="ts">
import { defineComponent, computed, toRef } from 'vue';
import { TreeRoot } from '../TreeRoot/TreeRoot';
import { useCurrentTreeNodes } from '../UseCurrentTreeNodes';
import { useNodeState } from './UseNodeState';
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
    const { nodes } = useCurrentTreeNodes(toRef(props, 'treeRoot'));
    const currentNode = computed<TreeNode>(
      () => nodes.value.getNodeById(props.nodeId),
    );
    const { state } = useNodeState(currentNode);

    const checked = computed<boolean>(() => state.value.checkState === TreeNodeCheckState.Checked);
    const indeterminate = computed<boolean>(
      () => state.value.checkState === TreeNodeCheckState.Indeterminate,
    );

    return {
      indeterminate,
      checked,
      currentNode,
    };
  },
});
</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;
@use "./../tree-colors" as *;

$sideSizeInPx: 30px;

.checkbox {
  position: relative;

  width: $sideSizeInPx;
  height: $sideSizeInPx;

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
</style>