<template>
  <!-- eslint-disable vue/no-v-html -->
  <div
    class="documentation-text"
    @click.stop
    v-html="renderedText"
  />
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue';
import { createMarkdownRenderer } from './MarkdownRenderer';

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

const renderer = createMarkdownRenderer();

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
@use 'sass:math';

$text-color: $color-on-primary;
$text-size: 0.75em; // Lower looks bad on Firefox
$base-spacing: $text-size;

@mixin code-block() {
  pre {
    @content; // :has(> code) { @content; } would be better, but Firefox doesn't support it https://caniuse.com/css-has
  }
}

@mixin inline-code() {
  :not(pre) > code {
    @content;
  }
}

@mixin code() {
  code {
    @content;
  }
}

.documentation-text {
  color: $text-color;
  font-size: $text-size;
  font-family: $font-main;

  @include code {
    font-family: $font-normal;
    font-weight: 600;
  }

  @include inline-code {
    word-break: break-all; // Enables inline code to wrap with the text, even for long single words (like registry paths), thus preventing overflow.
  }

  @include code-block {
    padding: $base-spacing;
    background: $color-primary-darker;
    overflow: auto; // Prevents horizontal expansion of inner content (e.g., when a code block is shown)
  }

  a {
    &[href] {
      word-break: break-word; // Enables long URLs to wrap within the container, preventing horizontal overflow.
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
        margin-left: math.div($text-size, 4);
      }
      /*
        Match color of global hover behavior. We need to do it manually because global hover sets
        `color` property but here we need to modify `background-color` property because color only
        works if SVG is embedded as HTML element (as `<svg/>`) not as `url(..)` as we do. Then the
        only option is to use `mask` and `background-color` properties.
      */
      @include hover-or-touch {
        &::after{
          background-color: $color-highlight;
        }
      }
    }
  }

  @mixin no-margin($selectors) {
    #{$selectors} {
      margin: 0;
    }
  }

  @mixin no-padding($selectors) {
    #{$selectors} {
      padding: 0;
    }
  }

  @mixin left-padding($selectors, $horizontal-spacing) {
    #{$selectors} {
      padding-inline-start: $horizontal-spacing;
    }
  }

  @mixin bottom-margin($selectors, $vertical-spacing) {
    #{$selectors} {
      &:not(:last-child) {
        margin-bottom: $vertical-spacing;
      }
    }
  }

  @mixin apply-uniform-vertical-spacing($base-vertical-spacing) {
    /* Reset default top/bottom margins added by browser. */
    @include no-margin('p');
    @include no-margin('h1, h2, h3, h4, h5, h6');
    @include no-margin('blockquote');
    @include no-margin('pre');

    /* Add spacing between elements using `margin-bottom` only (bottom-up instead of top-down strategy). */
    $small-vertical-spacing: math.div($base-vertical-spacing, 2);
    @include bottom-margin('p', $base-vertical-spacing);
    @include bottom-margin('h1, h2, h3, h4, h5, h6', $base-vertical-spacing);
    @include bottom-margin('ul, ol', $base-vertical-spacing);
    @include bottom-margin('li', $small-vertical-spacing);
    @include bottom-margin('table', $base-vertical-spacing);
    @include bottom-margin('blockquote', $base-vertical-spacing);
    @include bottom-margin('pre', $base-vertical-spacing);
  }

  @mixin apply-uniform-horizontal-spacing($base-horizontal-spacing) {
    /* Reset default left/right paddings added by browser. */
    @include no-padding('ul, ol');

    /* Add spacing for list items. */
    $large-horizontal-spacing: $base-horizontal-spacing * 2;
    @include left-padding('ul, ol', $large-horizontal-spacing);
  }

  @include apply-uniform-vertical-spacing($base-spacing);
  @include apply-uniform-horizontal-spacing($base-spacing);

  ul {
    /*
      Set list style explicitly, because otherwise it changes based on parent <ul>s in tree view.
      We reset the style from here.
    */
    list-style: square;
  }

  blockquote {
    padding: 0 $base-spacing;
    border-left: .25em solid $color-primary;
  }
}
</style>
