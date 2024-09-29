import { indentText } from '@/application/Common/Text/IndentText';
import { fetchWithTimeout } from './FetchWithTimeout';
import { getDomainFromUrl } from './UrlDomainProcessing';

export function fetchFollow(
  url: string,
  timeoutInMs: number,
  fetchOptions?: Partial<RequestInit>,
  followOptions?: Partial<FollowOptions>,
): Promise<Response> {
  const defaultedFollowOptions: Required<FollowOptions> = {
    ...DefaultFollowOptions,
    ...followOptions,
  };
  console.log(indentText(`Follow options: ${JSON.stringify(defaultedFollowOptions)}`));
  if (!followRedirects(defaultedFollowOptions)) {
    return fetchWithTimeout(url, timeoutInMs, fetchOptions);
  }
  fetchOptions = { ...fetchOptions, redirect: 'manual' /* handled manually */, mode: 'cors' };
  const cookies = new CookieStorage(defaultedFollowOptions.enableCookies);
  return followRecursivelyWithCookies(
    url,
    timeoutInMs,
    fetchOptions,
    defaultedFollowOptions.maximumRedirectFollowDepth,
    cookies,
  );
}

export interface FollowOptions {
  readonly followRedirects?: boolean;
  readonly maximumRedirectFollowDepth?: number;
  readonly enableCookies?: boolean;
}

const DefaultFollowOptions: Required<FollowOptions> = {
  followRedirects: true,
  maximumRedirectFollowDepth: 20,
  enableCookies: true,
};

async function followRecursivelyWithCookies(
  url: string,
  timeoutInMs: number,
  options: RequestInit,
  followDepth: number,
  cookies: CookieStorage,
): Promise<Response> {
  options = updateCookieHeader(cookies, options);
  const response = await fetchWithTimeout(
    url,
    timeoutInMs,
    options,
  );
  if (!isRedirect(response.status)) {
    return response;
  }
  const newFollowDepth = followDepth - 1;
  if (newFollowDepth < 0) {
    throw new Error(`[max-redirect] maximum redirect reached at: ${url}`);
  }
  const nextUrl = response.headers.get('location');
  if (!nextUrl) {
    return response;
  }
  const cookieHeader = response.headers.get('set-cookie');
  if (cookieHeader) {
    cookies.addHeader(cookieHeader);
  }
  options.headers = {
    ...options.headers,
    Host: getDomainFromUrl(nextUrl),
  };
  return followRecursivelyWithCookies(nextUrl, timeoutInMs, options, newFollowDepth, cookies);
}

function isRedirect(code: number): boolean {
  return code === 301 || code === 302 || code === 303 || code === 307 || code === 308;
}

class CookieStorage {
  public cookies = new Array<string>();

  constructor(private readonly enabled: boolean) {
  }

  public hasAny(): boolean {
    return this.enabled && this.cookies.length > 0;
  }

  public addHeader(header: string) {
    if (!this.enabled || !header) {
      return;
    }
    this.cookies.push(header);
  }

  public getHeader(): string {
    return this.cookies.join(' ; ');
  }
}

function followRedirects(options: FollowOptions): boolean {
  if (options.followRedirects !== true) {
    return false;
  }
  if (options.maximumRedirectFollowDepth === undefined || options.maximumRedirectFollowDepth <= 0) {
    throw new Error('Invalid followRedirects configuration: maximumRedirectFollowDepth must be a positive integer');
  }
  return true;
}

function updateCookieHeader(
  cookies: CookieStorage,
  options: RequestInit,
): RequestInit {
  if (!cookies.hasAny()) {
    return options;
  }
  const newOptions = { ...options, headers: { ...options.headers, cookie: cookies.getHeader() } };
  return newOptions;
}
