<template>
  <div
    class="documentation-text"
    v-html="renderedText"
    v-on:click.stop
    >
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { createRenderer } from './MarkdownRenderer';

@Component
export default class DocumentationText extends Vue {
  @Prop() public docs: readonly string[];

  private readonly renderer = createRenderer();

  get renderedText(): string {
    if (!this.docs || this.docs.length === 0) {
      return '';
    }
    if (this.docs.length === 1) {
      return this.renderer.render(this.docs[0]);
    }
    const bulletpoints = this.docs
      .map((doc) => renderAsMarkdownListItem(doc))
      .join('\n');
    return this.renderer.render(bulletpoints);
  }
}

function renderAsMarkdownListItem(content: string): string {
  if (!content || content.length === 0) {
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
        mask: url(~@/presentation/assets/icons/external-link.svg) no-repeat 50% 50%;
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
  /*
    Different browsers have different <p>, we should even this out.
    See CSS 2.1 specification https://www.w3.org/TR/CSS21/sample.html.
  */
  p {
    /*
      Remove surrounding padding so a markdown text that is a list (e.g. <ul>)
      has same outer padding as a paragraph (</p>).
    */
    margin: 0;
    + p {
      margin-top: 1em;
    }
  }
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
