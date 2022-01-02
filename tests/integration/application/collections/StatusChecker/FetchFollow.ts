import fetch from 'cross-fetch';

export function fetchFollow(
  url: string,
  fetchOptions: RequestInit,
  followOptions: IFollowOptions,
): Promise<Response> {
  followOptions = { ...DefaultOptions, ...followOptions };
  if (followRedirects(followOptions)) {
    return fetch(url, fetchOptions);
  }
  fetchOptions = { ...fetchOptions, redirect: 'manual' /* handled manually */ };
  const cookies = new CookieStorage(followOptions.enableCookies);
  return followRecursivelyWithCookies(
    url,
    fetchOptions,
    followOptions.maximumRedirectFollowDepth,
    cookies,
  );
}

export interface IFollowOptions {
  followRedirects?: boolean;
  maximumRedirectFollowDepth?: number;
  enableCookies?: boolean;
}

const DefaultOptions: IFollowOptions = {
  followRedirects: true,
  maximumRedirectFollowDepth: 20,
  enableCookies: true,
};

async function followRecursivelyWithCookies(
  url: string,
  options: RequestInit,
  followDepth: number,
  cookies: CookieStorage,
): Promise<Response> {
  options = updateCookieHeader(cookies, options);
  const response = await fetch(url, options);
  if (!isRedirect(response.status)) {
    return response;
  }
  const newFollowDepth = followDepth - 1;
  if (newFollowDepth < 0) {
    throw new Error(`[max-redirect] maximum redirect reached at: ${url}`);
  }
  const cookieHeader = response.headers.get('set-cookie');
  cookies.addHeader(cookieHeader);
  const nextUrl = response.headers.get('location');
  return followRecursivelyWithCookies(nextUrl, options, newFollowDepth, cookies);
}

function isRedirect(code: number): boolean {
  return code === 301 || code === 302 || code === 303 || code === 307 || code === 308;
}

class CookieStorage {
  public cookies = new Array<string>();

  constructor(private readonly enabled: boolean) {
  }

  public hasAny() {
    return this.enabled && this.cookies.length > 0;
  }

  public addHeader(header: string) {
    if (!this.enabled || !header) {
      return;
    }
    this.cookies.push(header);
  }

  public getHeader() {
    return this.cookies.join(' ; ');
  }
}

function followRedirects(options: IFollowOptions) {
  if (!options.followRedirects) {
    return false;
  }
  if (options.maximumRedirectFollowDepth === 0) {
    return false;
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
