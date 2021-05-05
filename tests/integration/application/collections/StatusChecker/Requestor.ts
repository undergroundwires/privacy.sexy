import { retryWithExponentialBackOffAsync } from './ExponentialBackOffRetryHandler';
import { IUrlStatus } from './IUrlStatus';
import fetch from 'cross-fetch';

export interface IRequestOptions {
    retryExponentialBaseInMs?: number;
    additionalHeaders?: Record<string, string>;
}

export async function getUrlStatusAsync(
    url: string,
    options: IRequestOptions = DefaultOptions): Promise<IUrlStatus> {
    options = { ...DefaultOptions, ...options };
    const fetchOptions = getFetchOptions(options);
    return retryWithExponentialBackOffAsync(async () => {
        console.log('Requesting', url); // tslint:disable-line: no-console
        try {
            const response = await fetch(url, fetchOptions);
            return { url, statusCode: response.status};
        } catch (err) {
            return { url, error: err};
        }
    }, options.retryExponentialBaseInMs);
}

const DefaultOptions: IRequestOptions = {
    retryExponentialBaseInMs: 5000,
    additionalHeaders: {},
};

function getFetchOptions(options: IRequestOptions) {
    return {
        method: 'GET',
        headers: { ...DefaultHeaders, ...options.additionalHeaders },
    };
}

const DefaultHeaders: Record<string, string> = {
    /* Chrome on macOS */
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
    'upgrade-insecure-requests': '1',
    'connection': 'keep-alive',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'accept-encoding': 'gzip, deflate, br',
    'cache-control': 'max-age=0',
    'accept-language': 'en-US,en;q=0.9',
};
