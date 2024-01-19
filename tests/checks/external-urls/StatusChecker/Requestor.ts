import { retryWithExponentialBackOff } from './ExponentialBackOffRetryHandler';
import { IUrlStatus } from './IUrlStatus';
import { fetchFollow, IFollowOptions, DefaultFollowOptions } from './FetchFollow';
import { getRandomUserAgent } from './UserAgents';

export function getUrlStatus(
  url: string,
  options: IRequestOptions = DefaultOptions,
): Promise<IUrlStatus> {
  const defaultedOptions = { ...DefaultOptions, ...options };
  const fetchOptions = getFetchOptions(url, defaultedOptions);
  return retryWithExponentialBackOff(async () => {
    console.log('Requesting', url);
    let result: IUrlStatus;
    try {
      const response = await fetchFollow(
        url,
        defaultedOptions.requestTimeoutInMs,
        fetchOptions,
        defaultedOptions.followOptions,
      );
      result = { url, code: response.status };
    } catch (err) {
      result = { url, error: JSON.stringify(err, null, '\t') };
    }
    return result;
  }, defaultedOptions.retryExponentialBaseInMs);
}

export interface IRequestOptions {
  readonly retryExponentialBaseInMs?: number;
  readonly additionalHeaders?: Record<string, string>;
  readonly additionalHeadersUrlIgnore?: string[];
  readonly followOptions?: IFollowOptions;
  readonly requestTimeoutInMs: number;
}

const DefaultOptions: Required<IRequestOptions> = {
  retryExponentialBaseInMs: 5000,
  additionalHeaders: {},
  additionalHeadersUrlIgnore: [],
  requestTimeoutInMs: 60 /* seconds */ * 1000,
  followOptions: DefaultFollowOptions,
};

function getFetchOptions(url: string, options: Required<IRequestOptions>): RequestInit {
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
