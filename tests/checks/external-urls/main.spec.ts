import { test, expect } from 'vitest';
import { parseApplication } from '@/application/Parser/ApplicationParser';
import type { IApplication } from '@/domain/IApplication';
import { indentText } from '@tests/shared/Text';
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';
import { type UrlStatus, formatUrlStatus } from './StatusChecker/UrlStatus';
import { getUrlStatusesInParallel, type BatchRequestOptions } from './StatusChecker/BatchStatusChecker';

// arrange
const app = parseApplication();
const urls = collectUniqueUrls({
  application: app,
  excludePatterns: [
    /^https:\/\/archive\.ph/, // Drops HEAD/GET requests via fetch/curl, responding to Postman/Chromium.
  ],
});
const requestOptions: BatchRequestOptions = {
  domainOptions: {
    sameDomainParallelize: false, // be nice to our third-party servers
    sameDomainDelayInMs: 5 /* sec */ * 1000,
  },
  requestOptions: {
    retryExponentialBaseInMs: 3 /* sec */ * 1000,
    requestTimeoutInMs: 60 /* sec */ * 1000,
    additionalHeaders: { referer: app.projectDetails.homepage },
    randomizeTlsFingerprint: true,
  },
  followOptions: {
    followRedirects: true,
    enableCookies: true,
  },
};
const testTimeoutInMs = urls.length * 60 /* seconds */ * 1000;
test(`all URLs (${urls.length}) should be alive`, async () => {
  // act
  const results = await getUrlStatusesInParallel(urls, requestOptions);
  // assert
  const deadUrls = results.filter((r) => r.code === undefined || !isOkStatusCode(r.code));
  expect(deadUrls).to.have.lengthOf(0, formatAssertionMessage([formatUrlStatusReport(deadUrls)]));
}, testTimeoutInMs);

function isOkStatusCode(statusCode: number): boolean {
  return statusCode >= 200 && statusCode < 300;
}

function collectUniqueUrls(
  options: {
    readonly application: IApplication,
    readonly excludePatterns?: readonly RegExp[],
  },
): string[] {
  return [ // Get all nodes
    ...options.application.collections.flatMap((c) => c.getAllCategories()),
    ...options.application.collections.flatMap((c) => c.getAllScripts()),
  ]
    // Get all docs
    .flatMap((documentable) => documentable.docs)
    // Parse all URLs
    .flatMap((docString) => extractUrls(docString))
    // Remove duplicates
    .filter((url, index, array) => array.indexOf(url) === index)
    // Exclude certain URLs based on patterns
    .filter((url) => !shouldExcludeUrl(url, options.excludePatterns ?? []));
}

function shouldExcludeUrl(url: string, patterns: readonly RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(url));
}

function formatUrlStatusReport(deadUrlStatuses: readonly UrlStatus[]): string {
  return `\n${deadUrlStatuses.map((status) => indentText(formatUrlStatus(status))).join('\n---\n')}\n`;
}

function extractUrls(textWithInlineCode: string): string[] {
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
