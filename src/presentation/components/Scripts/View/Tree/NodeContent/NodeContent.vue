<template>
  <DocumentableNode :docs="nodeMetadata.docs">
    <div id="node">
      <div class="item text">
        {{ nodeMetadata.text }}
      </div>
      <RevertToggle
        v-if="nodeMetadata.isReversible"
        class="item"
        :node="nodeMetadata"
      />
    </div>
  </DocumentableNode>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { NodeMetadata } from './NodeMetadata';
import RevertToggle from './RevertToggle.vue';
import DocumentableNode from './Documentation/DocumentableNode.vue';

export default defineComponent({
  components: {
    RevertToggle,
    DocumentableNode,
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

#node {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  .text {
    display: flex;
    align-items: center;
  }
  .item:not(:first-child) {
    margin-left: 5px;
  }
}
</style>
