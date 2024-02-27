import { sleep } from '@/infrastructure/Threading/AsyncSleep';
import { getUrlStatus, type IRequestOptions } from './Requestor';
import { groupUrlsByDomain } from './UrlPerDomainGrouper';
import type { IUrlStatus } from './IUrlStatus';

export async function getUrlStatusesInParallel(
  urls: string[],
  options?: IBatchRequestOptions,
): Promise<IUrlStatus[]> {
  // urls = [ 'https://privacy.sexy' ]; // Here to comment out when testing
  const uniqueUrls = Array.from(new Set(urls));
  const defaultedOptions = { ...DefaultOptions, ...options };
  console.log('Options: ', defaultedOptions);
  const results = await request(uniqueUrls, defaultedOptions);
  return results;
}

export interface IBatchRequestOptions {
  domainOptions?: IDomainOptions;
  requestOptions?: IRequestOptions;
}

interface IDomainOptions {
  sameDomainParallelize?: boolean;
  sameDomainDelayInMs?: number;
}

const DefaultOptions: Required<IBatchRequestOptions> = {
  domainOptions: {
    sameDomainParallelize: false,
    sameDomainDelayInMs: 3 /* sec */ * 1000,
  },
  requestOptions: {
    retryExponentialBaseInMs: 5 /* sec */ * 1000,
    requestTimeoutInMs: 60 /* sec */ * 1000,
    additionalHeaders: {},
  },
};

function request(
  urls: string[],
  options: Required<IBatchRequestOptions>,
): Promise<IUrlStatus[]> {
  if (!options.domainOptions.sameDomainParallelize) {
    return runOnEachDomainWithDelay(
      urls,
      (url) => getUrlStatus(url, options.requestOptions),
      options.domainOptions.sameDomainDelayInMs,
    );
  }
  return Promise.all(urls.map((url) => getUrlStatus(url, options.requestOptions)));
}

async function runOnEachDomainWithDelay(
  urls: string[],
  action: (url: string) => Promise<IUrlStatus>,
  delayInMs: number | undefined,
): Promise<IUrlStatus[]> {
  const grouped = groupUrlsByDomain(urls);
  const tasks = grouped.map(async (group) => {
    const results = new Array<IUrlStatus>();
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
