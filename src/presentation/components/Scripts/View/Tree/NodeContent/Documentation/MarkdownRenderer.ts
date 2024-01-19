import MarkdownIt from 'markdown-it';
import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';

export function createMarkdownRenderer(): MarkdownRenderer {
  const markdownParser = new MarkdownIt({
    linkify: false, // Disables auto-linking; handled manually for custom formatting.
    breaks: false, // Disables conversion of single newlines (`\n`) to HTML breaks (`<br>`).
  });
  configureLinksToOpenInNewTab(markdownParser);
  return {
    render: (markdownContent: string) => {
      markdownContent = beautifyAutoLinkedUrls(markdownContent);
      return markdownParser.render(markdownContent);
    },
  };
}

interface MarkdownRenderer {
  render(markdownContent: string): string;
}

const PlainTextUrlInMarkdownRegex = /(?<!\]\(|\[\d+\]:\s+|https?\S+|`)((?:https?):\/\/[^\s\])]*)(?:[\])](?!\()|$|\s)/gm;

function beautifyAutoLinkedUrls(content: string): string {
  if (!content) {
    return content;
  }
  return content.replaceAll(PlainTextUrlInMarkdownRegex, (_fullMatch, url) => {
    return formatReadableLink(url);
  });
}

function formatReadableLink(url: string): string {
  const urlParts = new URL(url);
  let displayText = formatHostName(urlParts.hostname);
  const pageLabel = extractPageLabel(urlParts);
  if (pageLabel) {
    displayText += ` - ${truncateTextFromEnd(capitalizeEachWord(pageLabel), 50)}`;
  }
  if (displayText.includes('Msdn.microsoft')) {
    console.log(`[${displayText}](${urlParts.href})`);
  }
  return buildMarkdownLink(displayText, urlParts.href);
}

function formatHostName(hostname: string): string {
  const withoutWww = hostname.replace(/^(www\.)/, '');
  const truncatedHostName = truncateTextFromStart(withoutWww, 30);
  return truncatedHostName;
}

function extractPageLabel(urlParts: URL): string | undefined {
  const readablePath = makePathReadable(urlParts.pathname);
  if (readablePath) {
    return readablePath;
  }
  return formatQueryParameters(urlParts.searchParams);
}

function buildMarkdownLink(label: string, url: string): string {
  return `[${label}](${url})`;
}

function formatQueryParameters(queryParameters: URLSearchParams): string | undefined {
  const queryValues = [...queryParameters.values()];
  if (queryValues.length === 0) {
    return undefined;
  }
  return findMostDescriptiveName(queryValues);
}

function truncateTextFromStart(text: string, maxLength: number): string {
  return text.length > maxLength ? `…${text.substring(text.length - maxLength)}` : text;
}

function truncateTextFromEnd(text: string, maxLength: number): string {
  return text.length > maxLength ? `${text.substring(0, maxLength)}…` : text;
}

function isNumeric(value: string): boolean {
  return /^\d+$/.test(value);
}

function makePathReadable(path: string): string | undefined {
  const decodedPath = decodeURI(path); // Decode URI components, e.g., '%20' to space
  const pathParts = decodedPath.split('/');
  const decodedPathParts = pathParts // Split then decode to correctly handle '%2F' as '/'
    .map((pathPart) => decodeURIComponent(pathPart));
  const descriptivePart = findMostDescriptiveName(decodedPathParts);
  if (!descriptivePart) {
    return undefined;
  }
  const withoutExtension = removeFileExtension(descriptivePart);
  const tokenizedText = tokenizeTextForReadability(withoutExtension);
  return tokenizedText;
}

function tokenizeTextForReadability(text: string): string {
  return text
    .replaceAll(/[-_+]/g, ' ') // Replace hyphens, underscores, and plus signs with spaces
    .replaceAll(/\s+/g, ' '); // Collapse multiple consecutive spaces into a single space
}

function removeFileExtension(value: string): string {
  const parts = value.split('.');
  if (parts.length === 1) {
    return value;
  }
  const extension = parts[parts.length - 1];
  if (extension.length > 9) {
    return value; // Heuristically web file extension is no longer than 9 chars (e.g. "html")
  }
  return parts.slice(0, -1).join('.');
}

function capitalizeEachWord(text: string): string {
  return text
    .split(' ')
    .map((word) => capitalizeFirstLetter(word))
    .join(' ');
}

function capitalizeFirstLetter(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function findMostDescriptiveName(segments: readonly string[]): string | undefined {
  const meaningfulSegments = segments.filter(isMeaningfulPathSegment);
  if (meaningfulSegments.length === 0) {
    return undefined;
  }
  const longestGoodSegment = meaningfulSegments.reduce((a, b) => (a.length > b.length ? a : b));
  return longestGoodSegment;
}

function isMeaningfulPathSegment(segment: string): boolean {
  return segment.length > 2 // This is often non-human categories like T5 etc.
    && !isNumeric(segment) // E.g. article numbers, issue numbers
    && !/^index(?:\.\S{0,10}$|$)/.test(segment) // E.g. index.html
    && !/^[A-Za-z]{2,4}([_-][A-Za-z]{4})?([_-]([A-Za-z]{2}|[0-9]{3}))$/.test(segment) // Locale string e.g. fr-FR
    && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(segment) // GUID
    && !/^[0-9a-f]{40}$/.test(segment); // Git SHA (e.g. GitHub links)
}

const AnchorAttributesForExternalLinks: Record<string, string> = {
  target: '_blank',
  rel: 'noopener noreferrer',
};

function configureLinksToOpenInNewTab(markdownParser: MarkdownIt): void {
  // https://github.com/markdown-it/markdown-it/blob/12.2.0/docs/architecture.md#renderer
  const defaultLinkRenderer = getDefaultRenderer(markdownParser, 'link_open');
  markdownParser.renderer.rules.link_open = (tokens, index, options, env, self) => {
    const currentToken = tokens[index];

    Object.entries(AnchorAttributesForExternalLinks).forEach(([attribute, value]) => {
      const existingValue = getTokenAttribute(currentToken, attribute);
      if (!existingValue) {
        addAttributeToToken(currentToken, attribute, value);
      } else if (existingValue !== value) {
        updateTokenAttribute(currentToken, attribute, value);
      }
    });
    return defaultLinkRenderer(tokens, index, options, env, self);
  };
}

function getDefaultRenderer(md: MarkdownIt, ruleName: string): Renderer.RenderRule {
  const ruleRenderer = md.renderer.rules[ruleName];
  return ruleRenderer || renderTokenAsDefault;
  function renderTokenAsDefault(tokens, idx, options, _env, self) {
    return self.renderToken(tokens, idx, options);
  }
}

function getTokenAttribute(token: Token, attributeName: string): string | undefined {
  const attributeIndex = token.attrIndex(attributeName);
  if (attributeIndex < 0) {
    return undefined;
  }
  const value = token.attrs[attributeIndex][1];
  return value;
}

function addAttributeToToken(token: Token, attributeName: string, value: string): void {
  token.attrPush([attributeName, value]);
}

function updateTokenAttribute(token: Token, attributeName: string, newValue: string): void {
  const attributeIndex = token.attrIndex(attributeName);
  if (attributeIndex < 0) {
    throw new Error(`Attribute "${attributeName}" not found in token.`);
  }
  token.attrs[attributeIndex][1] = newValue;
}
