import type { MarkdownRenderer } from '../MarkdownRenderer';

export class PlainTextUrlsToHyperlinksConverter implements MarkdownRenderer {
  public render(markdownContent: string): string {
    return autoLinkPlainUrls(markdownContent);
  }
}

const PlainTextUrlInMarkdownRegex = /(?<!\]\(|\[\d+\]:\s+|https?\S+|`)((?:https?):\/\/[^\s\])]*)(?:[\])](?!\()|$|\s)/gm;

function autoLinkPlainUrls(content: string): string {
  if (!content) {
    return content;
  }
  return content.replaceAll(PlainTextUrlInMarkdownRegex, (fullMatch, url) => {
    return fullMatch.replace(url, formatReadableLink(url));
  });
}

function formatReadableLink(url: string): string {
  const urlParts = new URL(url);
  let displayText = formatHostName(urlParts.hostname);
  const pageLabel = extractPageLabel(urlParts);
  if (pageLabel) {
    displayText += ` - ${truncateTextFromEnd(capitalizeEachWord(pageLabel), 50)}`;
  }
  return buildMarkdownLink(displayText, url);
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
