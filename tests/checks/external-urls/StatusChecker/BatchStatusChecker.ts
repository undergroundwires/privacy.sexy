import { sleep } from '@/infrastructure/Threading/AsyncSleep';
import { getUrlStatus, type RequestOptions } from './Requestor';
import { groupUrlsByDomain } from './UrlDomainProcessing';
import type { FollowOptions } from './FetchFollow';
import type { UrlStatus } from './UrlStatus';

export async function getUrlStatusesInParallel(
  urls: string[],
  options?: BatchRequestOptions,
): Promise<UrlStatus[]> {
  // urls = ['https://privacy.sexy']; // Comment out this line to use a hardcoded URL for testing.
  const uniqueUrls = Array.from(new Set(urls));
  const defaultedDomainOptions = { ...DefaultDomainOptions, ...options?.domainOptions };
  console.log('Batch request options applied:', defaultedDomainOptions);
  const results = await request(uniqueUrls, defaultedDomainOptions, options);
  return results;
}

export interface BatchRequestOptions {
  readonly domainOptions?: Partial<DomainOptions>;
  readonly requestOptions?: Partial<RequestOptions>;
  readonly followOptions?: Partial<FollowOptions>;
}

interface DomainOptions {
  readonly sameDomainParallelize?: boolean;
  readonly sameDomainDelayInMs?: number;
}

const DefaultDomainOptions: Required<DomainOptions> = {
  sameDomainParallelize: false,
  sameDomainDelayInMs: 3 /* sec */ * 1000,
};

function request(
  urls: string[],
  domainOptions: Required<DomainOptions>,
  options?: BatchRequestOptions,
): Promise<UrlStatus[]> {
  if (!domainOptions.sameDomainParallelize) {
    return runOnEachDomainWithDelay(
      urls,
      (url) => getUrlStatus(url, options?.requestOptions, options?.followOptions),
      domainOptions.sameDomainDelayInMs,
    );
  }
  return Promise.all(
    urls.map((url) => getUrlStatus(url, options?.requestOptions, options?.followOptions)),
  );
}

async function runOnEachDomainWithDelay(
  urls: string[],
  action: (url: string) => Promise<UrlStatus>,
  delayInMs: number | undefined,
): Promise<UrlStatus[]> {
  const grouped = groupUrlsByDomain(urls);
  const tasks = grouped.map(async (group) => {
    const results = new Array<UrlStatus>();
    /* eslint-disable no-await-in-loop */
    for (const url of group) {
      const status = await action(url);
      results.push(status);
      if (results.length !== group.length) {
        if (delayInMs !== undefined) {
          await sleep(delayInMs);
        }
      }
    }
    /* eslint-enable no-await-in-loop */
    return results;
  });
  const r = await Promise.all(tasks);
  return r.flat();
}
