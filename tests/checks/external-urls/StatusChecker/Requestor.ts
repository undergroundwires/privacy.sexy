import { indentText } from '@/application/Common/Text/IndentText';
import { retryWithExponentialBackOff } from './ExponentialBackOffRetryHandler';
import { fetchFollow, type FollowOptions } from './FetchFollow';
import { getRandomUserAgent } from './UserAgents';
import { getDomainFromUrl } from './UrlDomainProcessing';
import { randomizeTlsFingerprint, getTlsContextInfo } from './TlsFingerprintRandomizer';
import type { UrlStatus } from './UrlStatus';

export function getUrlStatus(
  url: string,
  requestOptions?: Partial<RequestOptions>,
  followOptions?: Partial<FollowOptions>,
): Promise<UrlStatus> {
  const defaultedOptions = getDefaultedRequestOptions(requestOptions);
  if (defaultedOptions.randomizeTlsFingerprint) {
    randomizeTlsFingerprint();
  }
  return fetchUrlStatusWithRetry(url, defaultedOptions, followOptions);
}

export interface RequestOptions {
  readonly retryExponentialBaseInMs?: number;
  readonly additionalHeaders?: Record<string, string>;
  readonly additionalHeadersUrlIgnore?: string[];
  readonly requestTimeoutInMs: number;
  readonly randomizeTlsFingerprint: boolean;
  readonly forceHttpGetForUrlPatterns: RegExp[];
}

const DefaultOptions: Required<RequestOptions> = {
  retryExponentialBaseInMs: 5 /* sec */ * 1000,
  additionalHeaders: {},
  additionalHeadersUrlIgnore: [],
  requestTimeoutInMs: 60 /* seconds */ * 1000,
  randomizeTlsFingerprint: true,
  forceHttpGetForUrlPatterns: [],
};

function fetchUrlStatusWithRetry(
  url: string,
  requestOptions: Required<RequestOptions>,
  followOptions?: Partial<FollowOptions>,
): Promise<UrlStatus> {
  const fetchOptions = getFetchOptions(url, requestOptions);
  return retryWithExponentialBackOff(async () => {
    console.log(`🚀 Initiating request for URL: ${url}`);
    console.log(indentText([
      `HTTP method: ${fetchOptions.method}`,
      `Request options: ${JSON.stringify(requestOptions)}`,
    ].join('\n')));
    let result: UrlStatus;
    try {
      const response = await fetchFollow(
        url,
        requestOptions.requestTimeoutInMs,
        fetchOptions,
        followOptions,
      );
      result = { url, code: response.status };
    } catch (err) {
      result = {
        url,
        error: [
          'Error:', indentText(JSON.stringify(err, null, '\t') || err.toString()),
          'Fetch options:', indentText(JSON.stringify(fetchOptions, null, '\t')),
          'Request options:', indentText(JSON.stringify(requestOptions, null, '\t')),
          'TLS:', indentText(getTlsContextInfo()),
        ].join('\n'),
      };
    }
    return result;
  }, requestOptions.retryExponentialBaseInMs);
}

function getFetchOptions(url: string, options: Required<RequestOptions>): RequestInit {
  const additionalHeaders = options.additionalHeadersUrlIgnore
    .some((ignorePattern) => url.startsWith(ignorePattern))
    ? {}
    : options.additionalHeaders;
  return {
    method: getHttpMethod(url, options),
    headers: {
      ...getDefaultHeaders(url),
      ...additionalHeaders,
    },
    redirect: 'manual', // Redirects are handled manually, automatic redirects do not work with Host header
  };
}

function getHttpMethod(url: string, options: Required<RequestOptions>): 'HEAD' | 'GET' {
  if (options.forceHttpGetForUrlPatterns.some((pattern) => url.match(pattern))) {
    return 'GET';
  }
  // By default fetch only headers without the full response body for better speed
  return 'HEAD';
}

function getDefaultHeaders(url: string): Record<string, string> {
  return {
    // Needed for websites that filter out non-browser user agents.
    'User-Agent': getRandomUserAgent(),

    // Required for some websites, especially those behind proxies, to correctly handle the request.
    Host: getDomainFromUrl(url),

    // The following mimic a real browser request to improve compatibility with most web servers.
    'Upgrade-Insecure-Requests': '1',
    Connection: 'keep-alive',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'max-age=0',
    'Accept-Language': 'en-US,en;q=0.9',
  };
}

function getDefaultedRequestOptions(
  options?: Partial<RequestOptions>,
): Required<RequestOptions> {
  return {
    ...DefaultOptions,
    ...options,
  };
}
