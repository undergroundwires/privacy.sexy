import { test, expect } from 'vitest';
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';
import { shuffle } from '@/application/Common/Shuffle';
import { indentText } from '@/application/Common/Text/IndentText';
import { loadApplicationComposite } from '@/application/Application/Loader/CompositeApplicationLoader';
import { type UrlStatus, formatUrlStatus } from './StatusChecker/UrlStatus';
import { getUrlStatusesInParallel, type BatchRequestOptions } from './StatusChecker/BatchStatusChecker';
import { TestExecutionDetailsLogger } from './TestExecutionDetailsLogger';
import { extractDocumentationUrls } from './DocumentationUrlExtractor';

const Logger = new TestExecutionDetailsLogger();

function main() {
  // arrange
  Logger.logTestSectionStartDelimiter();
  const app = loadApplicationComposite();
  let urls = extractDocumentationUrls({
    logger: Logger,
    urlExclusionPatterns: [
      /^https:\/\/archive\.ph/, // Drops HEAD/GET requests via fetch/curl, responding to Postman/Chromium.
    ],
    application: app,
  });
  urls = filterUrlsToEnvironmentCheckLimit(urls);
  Logger.logLabeledInformation('URLs submitted for testing', urls.length.toString());
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
  Logger.logLabeledInformation('HTTP request options', JSON.stringify(requestOptions, null, 2));
  const testTimeoutInMs = urls.length * 60 /* seconds */ * 1000;
  Logger.logLabeledInformation('Scheduled test duration', convertMillisecondsToHumanReadableFormat(testTimeoutInMs));
  Logger.logTestSectionEndDelimiter();
  test(`all URLs (${urls.length}) should be alive`, {
    timeout: testTimeoutInMs,
  }, async () => {
    // act
    const results = await getUrlStatusesInParallel(urls, requestOptions);
    // assert
    const deadUrls = results.filter((r) => r.code === undefined || !isOkStatusCode(r.code));
    expect(deadUrls).to.have.lengthOf(
      0,
      formatAssertionMessage([createReportForDeadUrlStatuses(deadUrls)]),
    );
  });
}

function isOkStatusCode(statusCode: number): boolean {
  return statusCode >= 200 && statusCode < 300;
}

function createReportForDeadUrlStatuses(deadUrlStatuses: readonly UrlStatus[]): string {
  return `\n${deadUrlStatuses.map((status) => indentText(formatUrlStatus(status))).join('\n---\n')}\n`;
}

function filterUrlsToEnvironmentCheckLimit(originalUrls: string[]): string[] {
  const { RANDOMIZED_URL_CHECK_LIMIT } = process.env;
  Logger.logLabeledInformation('URL check limit', RANDOMIZED_URL_CHECK_LIMIT || 'Unlimited');
  if (RANDOMIZED_URL_CHECK_LIMIT !== undefined && RANDOMIZED_URL_CHECK_LIMIT !== '') {
    const maxUrlsInTest = parseInt(RANDOMIZED_URL_CHECK_LIMIT, 10);
    if (Number.isNaN(maxUrlsInTest)) {
      throw new Error(`Invalid URL limit: ${RANDOMIZED_URL_CHECK_LIMIT}`);
    }
    if (maxUrlsInTest < originalUrls.length) {
      return shuffle(originalUrls).slice(0, maxUrlsInTest);
    }
  }
  return originalUrls;
}

function convertMillisecondsToHumanReadableFormat(milliseconds: number): string {
  const timeParts: string[] = [];
  const addTimePart = (amount: number, label: string) => {
    if (amount === 0) {
      return;
    }
    timeParts.push(`${amount} ${label}`);
  };

  const hours = milliseconds / (1000 * 60 * 60);
  const absoluteHours = Math.floor(hours);
  addTimePart(absoluteHours, 'hours');

  const minutes = (hours - absoluteHours) * 60;
  const absoluteMinutes = Math.floor(minutes);
  addTimePart(absoluteMinutes, 'minutes');

  const seconds = (minutes - absoluteMinutes) * 60;
  const absoluteSeconds = Math.floor(seconds);
  addTimePart(absoluteSeconds, 'seconds');

  return timeParts.join(', ');
}

main();
