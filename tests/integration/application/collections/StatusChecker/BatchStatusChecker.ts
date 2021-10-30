import { sleepAsync } from '@/infrastructure/Threading/AsyncSleep';
import { IUrlStatus } from './IUrlStatus';
import { getUrlStatusAsync, IRequestOptions } from './Requestor';
import { groupUrlsByDomain } from './UrlPerDomainGrouper';

export async function getUrlStatusesInParallelAsync(
    urls: string[],
    options?: IBatchRequestOptions): Promise<IUrlStatus[]> {
    // urls = [ 'https://privacy.sexy' ]; // Here to comment out when testing
    const uniqueUrls = Array.from(new Set(urls));
    options = { ...DefaultOptions, ...options };
    console.log('Options: ', options); // tslint:disable-line: no-console
    const results = await requestAsync(uniqueUrls, options);
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

const DefaultOptions: IBatchRequestOptions = {
    domainOptions: {
        sameDomainParallelize: false,
        sameDomainDelayInMs: 3 /* sec */ * 1000,
    },
    requestOptions: {
        retryExponentialBaseInMs: 5 /* sec */ * 1000,
        additionalHeaders: {},
    },
};

function requestAsync(urls: string[], options: IBatchRequestOptions): Promise<IUrlStatus[]> {
    if (!options.domainOptions.sameDomainParallelize) {
        return runOnEachDomainWithDelayAsync(
            urls,
            (url) => getUrlStatusAsync(url, options.requestOptions),
            options.domainOptions.sameDomainDelayInMs);
    } else {
        return Promise.all(
            urls.map((url) => getUrlStatusAsync(url, options.requestOptions)));
    }
}

async function runOnEachDomainWithDelayAsync(
    urls: string[],
    action: (url: string) => Promise<IUrlStatus>,
    delayInMs: number): Promise<IUrlStatus[]> {
    const grouped = groupUrlsByDomain(urls);
    const tasks = grouped.map(async (group) => {
        const results = new Array<IUrlStatus>();
        for (const url of group) {
            const status = await action(url);
            results.push(status);
            if (results.length !== group.length) {
                await sleepAsync(delayInMs);
            }
        }
        return results;
    });
    const r = await Promise.all(tasks);
    return r.flat();
}
