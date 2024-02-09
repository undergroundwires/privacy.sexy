<template>
  <MarkdownText
    class="documentation-text"
    :text="renderedMarkdown"
    @click.stop
  />
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue';
import MarkdownText from '../Markdown/MarkdownText.vue';

export default defineComponent({
  components: { MarkdownText },
  props: {
    docs: {
      type: Array as PropType<ReadonlyArray<string>>,
      default: () => [],
    },
  },
  setup(props) {
    const renderedMarkdown = computed<string>(() => buildMarkdownText(props.docs));
    return {
      renderedMarkdown,
    };
  },
});

function buildMarkdownText(docs: readonly string[] | undefined): string {
  if (!docs || docs.length === 0) {
    return '';
  }
  if (docs.length === 1) {
    return docs[0];
  }
  const bulletpointsMarkdown = docs
    .map((doc) => formatAsMarkdownListItem(doc))
    .join('\n');
  return bulletpointsMarkdown;
}

function formatAsMarkdownListItem(content: string): string {
  if (content.length === 0) {
    throw new Error('missing content');
  }
  const lines = content.split(/\r\n|\r|\n/);
  return `- ${lines[0]}${lines.slice(1)
    .map((line) => `\n  ${line}`)
    .join()}`;
}
</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

.documentation-text {
  display: flex;
  flex-direction: column;
  flex: 1; // Expands the container to fill available horizontal space, enabling alignment of child items.
  max-width: 100%; // Prevents horizontal expansion of inner content (e.g., when a code block is shown)

  font-size: $font-size-absolute-normal;
  font-family: $font-main;
}
</style>
