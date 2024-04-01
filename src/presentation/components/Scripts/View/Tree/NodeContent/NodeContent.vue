<template>
  <DocumentableNode
    class="node-content-wrapper"
    :docs="nodeMetadata.docs"
  >
    <div class="node-content">
      <div class="node-content-item">
        <NodeTitle :title="nodeMetadata.text" />
      </div>
      <RevertToggle
        v-if="nodeMetadata.isReversible"
        class="node-content-item"
        :node="nodeMetadata"
      />
    </div>
  </DocumentableNode>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import RevertToggle from './RevertToggle.vue';
import DocumentableNode from './Documentation/DocumentableNode.vue';
import NodeTitle from './NodeTitle.vue';
import type { NodeMetadata } from './NodeMetadata';

export default defineComponent({
  components: {
    RevertToggle,
    DocumentableNode,
    NodeTitle,
  },
  props: {
    nodeMetadata: {
      type: Object as PropType<NodeMetadata>,
      required: true,
    },
  },
});
</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

.node-content-wrapper {
  /*
    Compensate word breaking when it causes overflows of the node content,
    This issue happens on small devices when nodes are being rendered during search where the node header or
    documentation grows to cause to overflow.
  */
  overflow-wrap: anywhere;

  .node-content {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;

    .node-content-item:not(:first-child) {
      margin-left: 5px;
    }
  }
}
</style>
