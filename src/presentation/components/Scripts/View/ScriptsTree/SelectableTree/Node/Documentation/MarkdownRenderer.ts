import MarkdownIt from 'markdown-it';
import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';

export function createRenderer(): IRenderer {
  const md = new MarkdownIt({
    linkify: true, // Auto-convert URL-like text to links.
    breaks: false, // Do not convert single '\n's into <br>.
  });
  openUrlsInNewTab(md);
  return {
    render: (markdown: string) => {
      markdown = beatifyAutoLinks(markdown);
      return md.render(markdown);
    },
  };
}

export interface IRenderer {
  render(markdown: string): string;
}

function beatifyAutoLinks(content: string): string {
  if (!content) {
    return content;
  }
  return content.replaceAll(/(?<!\]\(|\[\d+\]:\s+|https?\S+|`)((?:https?):\/\/[^\s\])]*)(?:[\])](?!\()|$|\s)/gm, (_$, urlMatch) => {
    return toReadableLink(urlMatch);
  });
}

function toReadableLink(url: string): string {
  const parts = new URL(url);
  let displayName = toReadableHostName(parts.hostname);
  const pageName = extractPageName(parts);
  if (pageName) {
    displayName += ` - ${truncateRight(capitalizeEachLetter(pageName), 50)}`;
  }
  return `[${displayName}](${parts.href})`;
}

function toReadableHostName(hostname: string): string {
  const wwwStripped = hostname.replace(/^(www\.)/, '');
  const truncated = truncateLeft(wwwStripped, 30);
  return truncated;
}

function extractPageName(parts: URL): string | undefined {
  const path = toReadablePath(parts.pathname);
  if (path) {
    return path;
  }
  return toReadableQuery(parts);
}

function toReadableQuery(parts: URL): string | undefined {
  const queryValues = [...parts.searchParams.values()];
  if (queryValues.length === 0) {
    return undefined;
  }
  return selectMostDescriptiveName(queryValues);
}

function truncateLeft(phrase: string, threshold: number): string {
  return phrase.length > threshold ? `…${phrase.substring(phrase.length - threshold, phrase.length)}` : phrase;
}

function isDigit(value: string): boolean {
  return /^\d+$/.test(value);
}

function toReadablePath(path: string): string | undefined {
  const decodedPath = decodeURI(path); // Fixes e.g. %20 to whitespaces
  const pathPart = selectMostDescriptiveName(decodedPath.split('/'));
  if (!pathPart) {
    return undefined;
  }
  const extensionStripped = removeTrailingExtension(pathPart);
  const humanlyTokenized = extensionStripped.replaceAll(/[-_]/g, ' ');
  return humanlyTokenized;
}

function removeTrailingExtension(value: string): string {
  const parts = value.split('.');
  if (parts.length === 1) {
    return value;
  }
  if (parts.at(-1).length > 9) {
    return value; // Heuristically web file extension is no longer than 9 chars (e.g. "html")
  }
  return parts.slice(0, -1).join('.');
}

function capitalizeEachLetter(phrase: string): string {
  return phrase
    .split(' ')
    .map((word) => capitalizeFirstLetter(word))
    .join(' ');
  function capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

function truncateRight(phrase: string, threshold: number): string {
  return phrase.length > threshold ? `${phrase.substring(0, threshold)}…` : phrase;
}

function selectMostDescriptiveName(parts: readonly string[]): string | undefined {
  const goodParts = parts.filter(isGoodPathPart);
  if (goodParts.length === 0) {
    return undefined;
  }
  const longestGoodPart = goodParts.reduce((a, b) => (a.length > b.length ? a : b));
  return longestGoodPart;
}

function isGoodPathPart(part: string): boolean {
  return part
    && !isDigit(part) // E.g. article numbers, issue numbers
    && part.length > 2 // This is often non-human categories like T5 etc.
    && !/^index(?:\.\S{0,10}$|$)/.test(part) // E.g. index.html
    && !/^[A-Za-z]{2,4}([_-][A-Za-z]{4})?([_-]([A-Za-z]{2}|[0-9]{3}))$/.test(part) // Locale string e.g. fr-FR
    && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(part) // GUID
    && !/^[0-9a-f]{40}$/.test(part); // Git SHA (e.g. GitHub links)
}

const ExternalAnchorElementAttributes: Record<string, string> = {
  target: '_blank',
  rel: 'noopener noreferrer',
};

function openUrlsInNewTab(md: MarkdownIt) {
  // https://github.com/markdown-it/markdown-it/blob/12.2.0/docs/architecture.md#renderer
  const defaultRender = getOrDefaultRenderer(md, 'link_open');
  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx];

    Object.entries(ExternalAnchorElementAttributes).forEach(([name, value]) => {
      const currentValue = getAttribute(token, name);
      if (!currentValue) {
        token.attrPush([name, value]);
      } else if (currentValue !== value) {
        setAttribute(token, name, value);
      }
    });
    return defaultRender(tokens, idx, options, env, self);
  };
}

function getOrDefaultRenderer(md: MarkdownIt, ruleName: string): Renderer.RenderRule {
  const renderer = md.renderer.rules[ruleName];
  return renderer || defaultRenderer;
  function defaultRenderer(tokens, idx, options, _env, self) {
    return self.renderToken(tokens, idx, options);
  }
}

function getAttribute(token: Token, name: string): string | undefined {
  const attributeIndex = token.attrIndex(name);
  if (attributeIndex < 0) {
    return undefined;
  }
  const value = token.attrs[attributeIndex][1];
  return value;
}

function setAttribute(token: Token, name: string, value: string): void {
  const attributeIndex = token.attrIndex(name);
  if (attributeIndex < 0) {
    throw new Error('Attribute does not exist');
  }
  token.attrs[attributeIndex][1] = value;
}
