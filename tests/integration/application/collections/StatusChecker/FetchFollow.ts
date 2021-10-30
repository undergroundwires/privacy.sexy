import fetch from 'cross-fetch';

export function fetchFollow(
    url: string, fetchOptions: RequestInit, followOptions: IFollowOptions): Promise<Response> {
    followOptions = { ...DefaultOptions, ...followOptions };
    if (!followOptions.followRedirects
        || followOptions.maximumRedirectFollowDepth === 0) {
        return fetch(url, fetchOptions);
    }
    fetchOptions = { ...fetchOptions, redirect: 'manual' /* handled manually */ };
    const cookies = new CookieStorage(followOptions.enableCookies);
    return followRecursivelyWithCookies(
        url, fetchOptions, followOptions.maximumRedirectFollowDepth, cookies);
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
    url: string, options: RequestInit, followDepth: number, cookies: CookieStorage): Promise<Response> {
    if (cookies.hasAny()) {
        options = { ...options, headers: { ...options.headers, cookie: cookies.getHeader() } };
    }
    const response = await fetch(url, options);
    if (!isRedirect(response.status)) {
        return response;
    }
    if (--followDepth < 0) {
        throw new Error(`[max-redirect] maximum redirect reached at: ${url}`);
    }
    const cookieHeader = response.headers.get('set-cookie');
    cookies.addHeader(cookieHeader);
    const nextUrl = response.headers.get('location');
    return followRecursivelyWithCookies(nextUrl, options, followDepth, cookies);
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
