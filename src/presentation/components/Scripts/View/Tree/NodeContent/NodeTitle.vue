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
  font-size: $font-size-large;
}
</style>
