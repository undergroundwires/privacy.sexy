import { InlineReferenceLabelsToSuperscriptConverter } from './Renderers/InlineReferenceLabelsToSuperscriptConverter';
import { MarkdownItHtmlRenderer } from './Renderers/MarkdownItHtmlRenderer';
import { PlainTextUrlsToHyperlinksConverter } from './Renderers/PlainTextUrlsToHyperlinksConverter';
import type { MarkdownRenderer } from './MarkdownRenderer';

export class CompositeMarkdownRenderer implements MarkdownRenderer {
  constructor(
    private readonly renderers: readonly MarkdownRenderer[] = StandardMarkdownRenderers,
  ) {
    if (!renderers.length) {
      throw new Error('missing renderers');
    }
  }

  public render(markdownContent: string): string {
    let renderedContent = markdownContent;
    for (const renderer of this.renderers) {
      renderedContent = renderer.render(renderedContent);
    }
    return renderedContent;
  }
}

const StandardMarkdownRenderers: readonly MarkdownRenderer[] = [
  new PlainTextUrlsToHyperlinksConverter(),
  new InlineReferenceLabelsToSuperscriptConverter(),
  new MarkdownItHtmlRenderer(),
] as const;
