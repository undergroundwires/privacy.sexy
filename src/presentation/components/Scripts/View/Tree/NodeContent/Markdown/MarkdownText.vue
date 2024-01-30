<template>
  <!-- eslint-disable vue/no-v-html -->
  <div
    class="markdown-text"
    @click.stop
    v-html="htmlOutput"
  />
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { createMarkdownRenderer } from './MarkdownRenderer';

export default defineComponent({
  props: {
    text: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const htmlOutput = computed<string>(() => convertMarkdownToHtml(props.text));

    return {
      htmlOutput,
    };
  },
});

const renderer = createMarkdownRenderer();

function convertMarkdownToHtml(markdownText: string): string {
  return renderer.render(markdownText);
}
</script>

<style lang="scss"> /* Not scoped due to element styling such as "a". */
@use "@/presentation/assets/styles/main" as *;
@import './markdown-styles.scss';

$text-color: $color-on-primary;
$text-size: 0.75em; // Lower looks bad on Firefox

.markdown-text {
  color: $text-color;
  font-size: $text-size;
  font-family: $font-main;
  @include markdown-text-styles($text-size: $text-size);
}
</style>
