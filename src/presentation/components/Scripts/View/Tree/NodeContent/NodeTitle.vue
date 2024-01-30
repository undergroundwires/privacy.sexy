<template>
  <MarkdownText :text="title" class="node-title" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import MarkdownText from './Markdown/MarkdownText.vue';

export default defineComponent({
  components: {
    MarkdownText,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
  },
});
</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

.node-title {
  font-family: $font-main;
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
  overflow-y: none;
}
</style>
