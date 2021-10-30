# status-checker

CLI and SDK to check whether an external URL is alive.

🧐 Why?

- 🏃🏻 Batch checking status of URLs in parallel.
- 🤖 Zero-touch start, pre-configured for reliable results, still configurable.
- 🤞 Reliable, mimics a real web browser by following redirect, and cookie storage.

🍭 Sweets such as

- 😇 Queueing requests by domain to be nice to them
- 🔁 Retry pattern with exponential back-off

## CLI

Coming soon 🚧

## Programmatic usage

Programmatic usage is supported both on Node.js and browser.

### `getUrlStatusesInParallelAsync`

```js
// Simple example
const statuses = await getUrlStatusesInParallelAsync([ 'https://privacy.sexy', /* ... */ ]);
if(statuses.all((r) => r.code === 200)) {
    console.log('All URLs are alive!');
} else {
    console.log('Dead URLs:', statuses.filter((r) => r.code !== 200).map((r) => r.url));
}

// Fastest configuration
const statuses = await getUrlStatusesInParallelAsync([ 'https://privacy.sexy', /* ... */ ], {
    domainOptions: {
        sameDomainParallelize: false,
    }
});
```

#### Batch request options

- `domainOptions`:
  - **`sameDomainParallelize`**, (*boolean*), default: `false`
    - Determines whether the requests to URLs under same domain will be parallelize.
    - Setting `false` parallelizes all requests.
    - Setting `true` sends requests in queue for each unique domain, still parallelizing for different domains.
    - Requests to different domains are always parallelized regardless of this option.
    - 💡 This helps to avoid `429 Too Many Requests` and be nice to websites
  - **`sameDomainDelayInMs`** (*boolean*), default: `3000` (3 seconds)
    - Sets delay between requests to same host (domain) if same domain parallelization is disabled.
- `requestOptions` (*object*): See [request options](#request-options).

### `getUrlStatusAsync`

Checks whether single URL is dead or alive.

```js
// Simple example
const status = await getUrlStatusAsync('https://privacy.sexy');
console.log(`Status code: ${status.code}`);
```

#### Request options

- **`retryExponentialBaseInMs`** (*boolean*), default: `5000` (5 seconds)
  - The based time that's multiplied by exponential value for exponential backoff and retry calculations
  - The longer it is, the longer the delay between retries are.
- **`additionalHeaders`** (*boolean*), default: `false`
  - Additional headers that will be sent alongside default headers mimicking browser.
  - If default header are specified, additional headers override defaults.
- **`followOptions`** (*object*): See [follow options](#follow-options).

### `fetchFollow`

Gets response from single URL by following `3XX` redirect targets by sending necessary cookies.

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
  - Determines whether redirects with `3XX` response code will be followed.
- **`maximumRedirectFollowDepth`** (*boolean*), default: `20`
  - Determines maximum consequent redirects that will be followed.
  - 💡 Helps to solve maximum redirect reached errors.
- **`enableCookies`** (*boolean*), default: `true`
  - Saves cookies requested to store by webpages and sends them when redirected.
  - 💡 Helps to over-come sign-in challenges with callbacks.
