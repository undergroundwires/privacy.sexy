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
import { useCurrentTreeNodes } from '../UseCurrentTreeNodes';
import NodeCheckbox from './NodeCheckbox.vue';
import InteractableNode from './InteractableNode.vue';
import type { TreeNode, TreeNodeId } from './TreeNode';
import type { TreeRoot } from '../TreeRoot/TreeRoot';
import type { PropType } from 'vue';

export default defineComponent({
  components: {
    NodeCheckbox,
    InteractableNode,
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
  margin-bottom: $spacing-absolute-xx-small;
  margin-top: $spacing-absolute-xx-small;
  padding-bottom: $spacing-absolute-xx-small;
  padding-top: $spacing-absolute-xx-small;
  padding-right: $spacing-absolute-small;
  box-sizing: border-box;

  .content {
    display: flex; // We could provide `block`, but `flex` is more versatile.
    color: $color-node-fg;
    padding-left: $spacing-relative-small;
    padding-right: $spacing-absolute-x-small;
    text-decoration: none;
    user-select: none;
  }
}
</style>
