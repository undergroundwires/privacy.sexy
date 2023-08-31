import { retryWithExponentialBackOff } from './ExponentialBackOffRetryHandler';
import { IUrlStatus } from './IUrlStatus';
import { fetchFollow, IFollowOptions } from './FetchFollow';
import { getRandomUserAgent } from './UserAgents';

export function getUrlStatus(
  url: string,
  options: IRequestOptions = DefaultOptions,
): Promise<IUrlStatus> {
  options = { ...DefaultOptions, ...options };
  const fetchOptions = getFetchOptions(url, options);
  return retryWithExponentialBackOff(async () => {
    console.log('Requesting', url);
    let result: IUrlStatus;
    try {
      const response = await fetchFollow(
        url,
        options.requestTimeoutInMs,
        fetchOptions,
        options.followOptions,
      );
      result = { url, code: response.status };
    } catch (err) {
      result = { url, error: JSON.stringify(err, null, '\t') };
    }
    return result;
  }, options.retryExponentialBaseInMs);
}

export interface IRequestOptions {
  retryExponentialBaseInMs?: number;
  additionalHeaders?: Record<string, string>;
  additionalHeadersUrlIgnore?: string[];
  followOptions?: IFollowOptions;
  requestTimeoutInMs: number;
}

const DefaultOptions: IRequestOptions = {
  retryExponentialBaseInMs: 5000,
  additionalHeaders: {},
  additionalHeadersUrlIgnore: [],
  requestTimeoutInMs: 60 /* seconds */ * 1000,
};

function getFetchOptions(url: string, options: IRequestOptions): RequestInit {
  const additionalHeaders = options.additionalHeadersUrlIgnore
    .some((ignorePattern) => url.startsWith(ignorePattern))
    ? {}
    : options.additionalHeaders;
  return {
    method: 'HEAD',
    headers: {
      ...getDefaultHeaders(),
      ...additionalHeaders,
    },
  };
}

function getDefaultHeaders(): Record<string, string> {
  return {
    'user-agent': getRandomUserAgent(),
    'upgrade-insecure-requests': '1',
    connection: 'keep-alive',
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'accept-encoding': 'gzip, deflate, br',
    'cache-control': 'max-age=0',
    'accept-language': 'en-US,en;q=0.9',
  };
}
