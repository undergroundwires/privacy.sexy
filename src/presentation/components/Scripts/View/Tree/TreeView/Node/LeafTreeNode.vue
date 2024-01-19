<template>
  <li>
    <InteractableNode
      :node-id="nodeId"
      :tree-root="treeRoot"
      class="node"
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
    </InteractableNode>
  </li>
</template>

<script lang="ts">
import { defineComponent, computed, toRef } from 'vue';
import { TreeRoot } from '../TreeRoot/TreeRoot';
import { useCurrentTreeNodes } from '../UseCurrentTreeNodes';
import { TreeNode } from './TreeNode';
import NodeCheckbox from './NodeCheckbox.vue';
import InteractableNode from './InteractableNode.vue';
import type { PropType } from 'vue';

export default defineComponent({
  components: {
    NodeCheckbox,
    InteractableNode,
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
    const { nodes } = useCurrentTreeNodes(toRef(props, 'treeRoot'));
    const currentNode = computed<TreeNode>(() => nodes.value.getNodeById(props.nodeId));

    return {
      currentNode,
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
.node {
  margin-bottom: 3px;
  margin-top: 3px;
  padding-bottom: 3px;
  padding-top: 3px;
  padding-right: 6px;
  box-sizing: border-box;

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
