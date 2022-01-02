import { retryWithExponentialBackOff } from './ExponentialBackOffRetryHandler';
import { IUrlStatus } from './IUrlStatus';
import { fetchFollow, IFollowOptions } from './FetchFollow';

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
      const response = await fetchFollow(url, fetchOptions, options.followOptions);
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
}

const DefaultOptions: IRequestOptions = {
  retryExponentialBaseInMs: 5000,
  additionalHeaders: {},
  additionalHeadersUrlIgnore: [],
};

function getFetchOptions(url: string, options: IRequestOptions): RequestInit {
  const additionalHeaders = options.additionalHeadersUrlIgnore
    .some((ignorePattern) => url.match(ignorePattern))
    ? {}
    : options.additionalHeaders;
  return {
    method: 'GET',
    headers: { ...DefaultHeaders, ...additionalHeaders },
  };
}

const DefaultHeaders: Record<string, string> = {
  /* Chrome on macOS */
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
  'upgrade-insecure-requests': '1',
  connection: 'keep-alive',
  accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
  'accept-encoding': 'gzip, deflate, br',
  'cache-control': 'max-age=0',
  'accept-language': 'en-US,en;q=0.9',
};
