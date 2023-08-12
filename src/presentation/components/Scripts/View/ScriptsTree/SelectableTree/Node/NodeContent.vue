<template>
  <DocumentableNode :docs="data.docs">
    <div id="node">
      <div class="item text">{{ data.text }}</div>
      <RevertToggle
        class="item"
        v-if="data.isReversible"
        :node="data" />
    </div>
  </DocumentableNode>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { INodeContent } from './INodeContent';
import RevertToggle from './RevertToggle.vue';
import DocumentableNode from './Documentation/DocumentableNode.vue';

export default defineComponent({
  components: {
    RevertToggle,
    DocumentableNode,
  },
  props: {
    data: {
      type: Object as PropType<INodeContent>,
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
