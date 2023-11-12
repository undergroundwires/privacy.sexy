<template>
  <div
    class="documentation-text"
    v-html="renderedText"
    v-on:click.stop
  />
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue';
import { createRenderer } from './MarkdownRenderer';

export default defineComponent({
  props: {
    docs: {
      type: Array as PropType<ReadonlyArray<string>>,
      default: () => [],
    },
  },
  setup(props) {
    const renderedText = computed<string>(() => renderText(props.docs));

    return {
      renderedText,
    };
  },
});

const renderer = createRenderer();

function renderText(docs: readonly string[] | undefined): string {
  if (!docs || docs.length === 0) {
    return '';
  }
  if (docs.length === 1) {
    return renderer.render(docs[0]);
  }
  const bulletpoints = docs
    .map((doc) => renderAsMarkdownListItem(doc))
    .join('\n');
  return renderer.render(bulletpoints);
}

function renderAsMarkdownListItem(content: string): string {
  if (content.length === 0) {
    throw new Error('missing content');
  }
  const lines = content.split(/\r\n|\r|\n/);
  return `- ${lines[0]}${lines.slice(1)
    .map((line) => `\n  ${line}`)
    .join()}`;
}
</script>

<style lang="scss"> /* Not scoped due to element styling such as "a". */
@use "@/presentation/assets/styles/main" as *;
$text-color: $color-on-primary;
$text-size: 0.75em; // Lower looks bad on Firefox

.documentation-text {
  color: $text-color;
  font-size: $text-size;
  font-family: $font-main;
  code {
    word-break: break-all; // Inline code should wrap with the line, or whole text overflows
    font-family: $font-normal;
    font-weight: 600;
  }
  a {
    &[href] {
      word-break: break-word; // So URLs don't overflow
    }
    &[href^="http"]{
      &:after {
        /*
          Use mask element instead of content/background-image etc.
          This way we can apply current font color to it to match the theme
        */
        mask: url(@/presentation/assets/icons/external-link.svg) no-repeat 50% 50%;
        mask-size: cover;
        content: '';

        display: inline-block;
        width: $text-size;
        height: $text-size;

        background-color: $text-color;
        margin-left: calc($text-size / 4);
      }
      /*
        Match color of global hover behavior. We need to do it manually because global hover sets
        `color` property but here we need to modify `background-color` property because color only
        works if SVG is embedded as HTML element (as `<svg/>`) not as `url(..)` as we do. Then the
        only option is to use `mask` and `background-color` properties.
      */
      @include hover-or-touch {
        &::after{
          background-color: $globals-color-hover;
        }
      }
    }
  }
  @mixin set-paragraph-vertical-gap($paragraph-vertical-gap) {
    p {
      /*
        Remove default browser margin on paragraphs to ensure:
          1. A markdown text represented as a list (e.g. <ul>, <ol>) has same vertical spacing as a standalone paragraph (</p>).
          2. The first paragraph in a sequence (first `<p>` usage) does not introduce top spacing.
          3. Uniformity, so margin can be set consistently across browsers.
      */
      margin: 0;
    }
    /*
      Introduce spacing between successive elements and paragraphs.
      E.g., spacing between two paragraphs (`p`), paragraphs after lists (<ul>, <ol>)...
    */
    * {
      + p {
        margin-top: $paragraph-vertical-gap;
      }
    }
  }
  @include set-paragraph-vertical-gap($text-size);
  ul {
    // CSS default is 40px, if the text is a bulletpoint, it leads to unexpected padding.
    padding-inline-start: 1em;

    /*
      Set list style explicitly, because otherwise it changes based on parent <ul>s in tree view.
      We reset the style from here.
    */
    list-style: square;
  }
}
</style>
