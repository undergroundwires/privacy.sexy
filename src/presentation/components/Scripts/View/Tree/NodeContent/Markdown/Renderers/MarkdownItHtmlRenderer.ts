import MarkdownIt from 'markdown-it';
import type { MarkdownRenderer } from '../MarkdownRenderer';
import type { RenderRule } from 'markdown-it/lib/renderer.mjs'; // eslint-disable-line import/extensions

export class MarkdownItHtmlRenderer implements MarkdownRenderer {
  public render(markdownContent: string): string {
    const markdownParser = new MarkdownIt({
      html: true, // Enable HTML tags in source to allow other custom rendering logic.
      linkify: false, // Disables auto-linking; handled manually for custom formatting.
      breaks: false, // Disables conversion of single newlines (`\n`) to HTML breaks (`<br>`).
    });
    configureLinksToOpenInNewTab(markdownParser);
    return markdownParser.render(markdownContent);
  }
}

function configureLinksToOpenInNewTab(markdownParser: MarkdownIt): void {
  // https://github.com/markdown-it/markdown-it/blob/14.0.0/docs/architecture.md#renderer
  const defaultLinkRenderer = getDefaultRenderer(markdownParser, 'link_open');
  markdownParser.renderer.rules.link_open = (tokens, index, options, env, self) => {
    const currentToken = tokens[index];
    Object.entries(AnchorAttributesForExternalLinks).forEach(([attribute, value]) => {
      currentToken.attrSet(attribute, value);
    });
    return defaultLinkRenderer(tokens, index, options, env, self);
  };
}

function getDefaultRenderer(md: MarkdownIt, ruleName: string): RenderRule {
  const ruleRenderer = md.renderer.rules[ruleName];
  const renderTokenAsDefault: RenderRule = (tokens, idx, options, _env, self) => {
    return self.renderToken(tokens, idx, options);
  };
  return ruleRenderer || renderTokenAsDefault;
}

const AnchorAttributesForExternalLinks: Record<string, string> = {
  target: '_blank',
  rel: 'noopener noreferrer',
} as const;
