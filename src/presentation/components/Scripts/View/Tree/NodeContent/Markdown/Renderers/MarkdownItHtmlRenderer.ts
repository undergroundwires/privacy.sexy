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
    return hardenRenderedAnchors(markdownParser.render(markdownContent));
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

const SupportedExternalProtocols = ['https:', 'http:', 'mailto:'] as const;

function hardenRenderedAnchors(renderedHtml: string): string {
  return renderedHtml.replaceAll(/<a\b[^>]*>/g, (anchorTag) => {
    let hardenedTag = setOrAppendAttribute(
      anchorTag,
      'target',
      AnchorAttributesForExternalLinks.target,
    );
    hardenedTag = setOrAppendAttribute(
      hardenedTag,
      'rel',
      AnchorAttributesForExternalLinks.rel,
    );
    return removeUnsafeHref(hardenedTag);
  });
}

function setOrAppendAttribute(anchorTag: string, attributeName: string, attributeValue: string): string {
  const attributeRegex = new RegExp(`\\s${attributeName}=(["']).*?\\1`, 'i');
  const normalizedAttribute = ` ${attributeName}="${attributeValue}"`;
  if (attributeRegex.test(anchorTag)) {
    return anchorTag.replace(attributeRegex, normalizedAttribute);
  }
  return anchorTag.replace('<a', `<a${normalizedAttribute}`);
}

function removeUnsafeHref(anchorTag: string): string {
  const hrefMatch = anchorTag.match(/\shref=(["'])(.*?)\1/i);
  if (!hrefMatch) {
    return anchorTag;
  }
  const hrefValue = hrefMatch[2];
  if (isSafeHref(hrefValue)) {
    return anchorTag;
  }
  return anchorTag.replace(hrefMatch[0], '');
}

function isSafeHref(hrefValue: string): boolean {
  if (!hrefValue) {
    return false;
  }
  if (hrefValue.startsWith('#') || hrefValue.startsWith('/')) {
    return true;
  }
  try {
    const { protocol } = new URL(hrefValue);
    return SupportedExternalProtocols.includes(protocol as typeof SupportedExternalProtocols[number]);
  } catch {
    return false;
  }
}
