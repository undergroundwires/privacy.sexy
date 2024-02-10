import { test, expect } from 'vitest';
import { parseApplication } from '@/application/Parser/ApplicationParser';
import { IApplication } from '@/domain/IApplication';
import { IUrlStatus } from './StatusChecker/IUrlStatus';
import { getUrlStatusesInParallel, IBatchRequestOptions } from './StatusChecker/BatchStatusChecker';

const app = parseApplication();
const urls = collectUniqueUrls(app);
const requestOptions: IBatchRequestOptions = {
  domainOptions: {
    sameDomainParallelize: false, // be nice to our external servers
    sameDomainDelayInMs: 5 /* sec */ * 1000,
  },
  requestOptions: {
    retryExponentialBaseInMs: 3 /* sec */ * 1000,
    requestTimeoutInMs: 60 /* sec */ * 1000,
    additionalHeaders: { referer: app.projectDetails.homepage },
  },
};
const testTimeoutInMs = urls.length * 60 /* seconds */ * 1000;

test(`all URLs (${urls.length}) should be alive`, async () => {
  const results = await getUrlStatusesInParallel(urls, requestOptions);
  const deadUrls = results.filter((r) => r.code !== 200);
  expect(deadUrls).to.have.lengthOf(0, printUrls(deadUrls));
}, testTimeoutInMs);

function collectUniqueUrls(application: IApplication): string[] {
  return [ // Get all nodes
    ...application.collections.flatMap((c) => c.getAllCategories()),
    ...application.collections.flatMap((c) => c.getAllScripts()),
  ]
    // Get all docs
    .flatMap((documentable) => documentable.docs)
    // Parse all URLs
    .flatMap((docString) => docString.match(/(https?:\/\/[^\s`"<>()]+)/g) || [])
    // Remove duplicates
    .filter((url, index, array) => array.indexOf(url) === index);
}

function printUrls(statuses: IUrlStatus[]): string {
  /* eslint-disable prefer-template */
  return '\n'
    + statuses.map((status) => `- ${status.url}\n`
        + (status.code ? `\tResponse code: ${status.code}` : '')
        + (status.error ? `\tError: ${status.error}` : ''))
      .join('\n')
    + '\n';
  /* eslint-enable prefer-template */
}
