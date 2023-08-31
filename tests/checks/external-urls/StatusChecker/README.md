# status-checker

A CLI and SDK for checking the availability of external URLs.

🧐 Why?

- 🏃 **Fast**: Batch checks the statuses of URLs in parallel.
- 🤖 **Easy-to-Use**: Zero-touch startup with pre-configured settings for reliable results, yet customizable.
- 🤞 **Reliable**: Mimics real web browser behavior by following redirects and maintaining cookie storage.

🍭 Additional features

- 😇 **Rate Limiting**: Queues requests by domain to be polite.
- 🔁 **Retries**: Implements retry pattern with exponential back-off.
- ⌚ **Timeouts**: Configurable timeout for each request.
- 🎭️ **User-Agent Rotation**: Change user agents for each request.

## CLI

Coming soon 🚧

## Programmatic usage

The SDK supports both Node.js and browser environments.

### `getUrlStatusesInParallel`

```js
// Simple example
const statuses = await getUrlStatusesInParallel([ 'https://privacy.sexy', /* ... */ ]);
if(statuses.all((r) => r.code === 200)) {
  console.log('All URLs are alive!');
} else {
  console.log('Dead URLs:', statuses.filter((r) => r.code !== 200).map((r) => r.url));
}

// Fastest configuration
const statuses = await getUrlStatusesInParallel([ 'https://privacy.sexy', /* ... */ ], {
  domainOptions: {
    sameDomainParallelize: false,
  }
});
```

#### Batch request options

- `domainOptions`:
  - **`sameDomainParallelize`**, (*boolean*), default: `false`
    - Determines if requests to the same domain will be parallelized.
    - Setting to `false` makes all requests parallel.
    - Setting to `true` queues requests for each unique domain while parallelizing across different domains.
    - Requests to different domains are always parallelized regardless of this option.
    - 💡 This helps to avoid `429 Too Many Requests` and be nice to websites
  - **`sameDomainDelayInMs`** (*number*), default: `3000` (3 seconds)
    - Sets the delay between requests to the same domain.
- `requestOptions` (*object*): See [request options](#request-options).

### `getUrlStatus`

Check the availability of a single URL.

```js
// Simple example
const status = await getUrlStatus('https://privacy.sexy');
console.log(`Status code: ${status.code}`);
```

#### Request options

- **`retryExponentialBaseInMs`** (*number*), default: `5000` (5 seconds)
  - Base time for the exponential back-off calculation for retries.
  - The longer the base time, the greater the intervals between retries.
- **`additionalHeaders`** (*object*), default: `false`
  - Additional HTTP headers to send along with the default headers. Overrides default headers if specified.
- **`followOptions`** (*object*): See [follow options](#follow-options).
- **`requestTimeoutInMs`**  (*number*), default: `60000` (60 seconds)
  - Time limit to abort the request if no response is received within the specified time frame.

### `fetchFollow`

Follows `3XX` redirects while preserving cookies.

Same fetch API except third parameter that specifies [follow options](#follow-options), `redirect: 'follow' | 'manual' | 'error'` is discarded in favor of the third parameter.

```js
const status = await fetchFollow('https://privacy.sexy', {
        // First argument is same options as fetch API, except `redirect` options
        // that's discarded in favor of next argument follow options
        headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0'
        },
    }, {
        // Second argument sets the redirect behavior
        followRedirects: true,
        maximumRedirectFollowDepth: 20,
        enableCookies: true,
    }
);
console.log(`Status code: ${status.code}`); 
```

#### Follow options

- **`followRedirects`** (*boolean*), default: `true`
  - Determines whether or not to follow redirects with `3XX` response codes.
- **`maximumRedirectFollowDepth`** (*boolean*), default: `20`
  - Specifies the maximum number of sequential redirects that the function will follow.
  - 💡 Helps to solve maximum redirect reached errors.
- **`enableCookies`** (*boolean*), default: `true`
  - Enables cookie storage to facilitate seamless navigation through login or other authentication challenges.
  - 💡 Helps to over-come sign-in challenges with callbacks.
