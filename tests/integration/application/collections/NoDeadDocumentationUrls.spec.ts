import { describe, it, expect } from 'vitest';
import { parseApplication } from '@/application/Parser/ApplicationParser';
import { IApplication } from '@/domain/IApplication';
import { IUrlStatus } from './StatusChecker/IUrlStatus';
import { getUrlStatusesInParallel, IBatchRequestOptions } from './StatusChecker/BatchStatusChecker';

describe('collections', () => {
  // arrange
  const app = parseApplication();
  const urls = collectUniqueUrls(app);
  const options: IBatchRequestOptions = {
    domainOptions: {
      sameDomainParallelize: true, // no need to be so nice until sources start failing
      // sameDomainDelayInMs: 2 /* sec */ * 1000,
    },
    requestOptions: {
      retryExponentialBaseInMs: 3 /* sec */ * 1000,
      additionalHeaders: { referer: app.info.homepage },
      additionalHeadersUrlIgnore: [
        'http://batcmd.com/', // Otherwise it responds with 403
      ],
    },
  };
  const testTimeoutInMs = urls.length * 60 /* minutes */ * 1000;
  it('have no dead urls', async () => {
    // act
    const results = await getUrlStatusesInParallel(urls, options);
    // assert
    const deadUrls = results.filter((r) => r.code !== 200);
    expect(deadUrls).to.have.lengthOf(0, printUrls(deadUrls));
  }, testTimeoutInMs);
});

function collectUniqueUrls(app: IApplication): string[] {
  return [ // Get all nodes
    ...app.collections.flatMap((c) => c.getAllCategories()),
    ...app.collections.flatMap((c) => c.getAllScripts()),
  ]
    // Get all docs
    .flatMap((documentable) => documentable.docs)
    // Parse all URLs
    .flatMap((docString) => docString.match(/(https?:\/\/[^\s]+)/g) || [])
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
