import type { Application } from '@/domain/Application';
import type { TestExecutionDetailsLogger } from './TestExecutionDetailsLogger';

interface UrlExtractionContext {
  readonly logger: TestExecutionDetailsLogger;
  readonly application: Application;
  readonly urlExclusionPatterns: readonly RegExp[];
}

export function extractDocumentationUrls(
  context: UrlExtractionContext,
): string[] {
  const urlsInApplication = extractUrlsFromApplication(context.application);
  context.logger.logLabeledInformation(
    'Extracted URLs from application',
    urlsInApplication.length.toString(),
  );
  const uniqueUrls = filterDuplicateUrls(urlsInApplication);
  context.logger.logLabeledInformation(
    'Unique URLs after deduplication',
    `${uniqueUrls.length} (duplicates removed)`,
  );
  context.logger.logLabeledInformation(
    'Exclusion patterns for URLs',
    context.urlExclusionPatterns.length === 0
      ? 'None (all URLs included)'
      : context.urlExclusionPatterns.map((pattern, index) => `${index + 1}) ${pattern.toString()}`).join('\n'),
  );
  const includedUrls = filterUrlsExcludingPatterns(uniqueUrls, context.urlExclusionPatterns);
  context.logger.logLabeledInformation(
    'URLs extracted for testing',
    `${includedUrls.length} (after applying exclusion patterns; ${uniqueUrls.length - includedUrls.length} URLs ignored)`,
  );
  return includedUrls;
}

function extractUrlsFromApplication(application: Application): string[] {
  return [ // Get all executables
    ...application.collections.flatMap((c) => c.getAllCategories()),
    ...application.collections.flatMap((c) => c.getAllScripts()),
  ]
    // Get all docs
    .flatMap((documentable) => documentable.docs)
    // Parse all URLs
    .flatMap((docString) => extractUrlsExcludingCodeBlocks(docString));
}

function filterDuplicateUrls(urls: readonly string[]): string[] {
  return urls.filter((url, index, array) => array.indexOf(url) === index);
}

function filterUrlsExcludingPatterns(
  urls: readonly string[],
  patterns: readonly RegExp[],
): string[] {
  return urls.filter((url) => !patterns.some((pattern) => pattern.test(url)));
}

function extractUrlsExcludingCodeBlocks(textWithInlineCode: string): string[] {
  /*
    Matches URLs:
    - Excludes inline code blocks as they may contain URLs not intended for user interaction
      and not guaranteed to support expected HTTP methods, leading to false-negatives.
    - Supports URLs containing parentheses, avoiding matches within code that might not represent
      actual links.
  */
  const nonCodeBlockUrlRegex = /(?<!`)(https?:\/\/[^\s`"<>()]+(?:\([^\s`"<>()]*\))?[^\s`"<>()]*)/g;
  return textWithInlineCode.match(nonCodeBlockUrlRegex) || [];
}
