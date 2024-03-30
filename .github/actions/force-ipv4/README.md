# force-ipv4

## Overview

This GitHub action enforces IPv4 for all outgoing network requests. It addresses connectivity issues encountered in GitHub runners, where IPv6 requests may lead to timeouts due to the lack of IPv6 support [1] [2].

## Background

Some applications attempt network connections over IPv6.
Such as requests made by Node's `fetch` API causes `UND_ERR_CONNECT_TIMEOUT` [3] [4] and similar issues [5].
This happens when the software cannot handle this such as by using Happy Eyeballs [6] [7].

## Usage

To use this action in your GitHub workflow, add the following step before any job that requires network access:

```yaml
- name: Enforce IPv4 Connectivity
  uses: ./.github/actions/force-ipv4
```

## Note

This action is a workaround addressing specific IPv6-related connectivity issues on GitHub runners and may not be necessary if GitHub's infrastructure evolves to fully support IPv6 in the future.

[1]: https://archive.ph/2024.03.28-185829/https://github.com/actions/runner/issues/3138 "Actions Runner fails on IPv6 only host · Issue #3138 · actions/runner · GitHub | github.com"
[2]: https://archive.ph/2024.03.28-185838/https://github.com/actions/runner-images/issues/668 "IPv6 on GitHub-hosted runners · Issue #668 · actions/runner-images · GitHub | github.com"
[3]: https://archive.ph/2024.03.28-185847/https://github.com/actions/runner/issues/3213 "GitHub runner cannot send `fetch` with `node`, failing with IPv6 DNS error `UND_ERR_CONNECT_TIMEOUT` · Issue #3213 · actions/runner · GitHub | github.com"
[4]: https://archive.ph/2024.03.28-185853/https://github.com/actions/runner-images/issues/9540 "Cannot send outbound requests using node fetch, failing with IPv6 DNS error UND_ERR_CONNECT_TIMEOUT · Issue #9540 · actions/runner-images · GitHub | github.com"
[5]: https://archive.today/2024.03.30-113315/https://github.com/nodejs/node/issues/40537 "\"localhost\" favours IPv6 in node v17, used to favour IPv4 · Issue #40537 · nodejs/node · GitHub"
[6]: https://archive.ph/2024.03.28-185900/https://github.com/nodejs/node/issues/41625 "Happy Eyeballs support (address IPv6 issues in Node 17) · Issue #41625 · nodejs/node · GitHub | github.com"
[7]: https://archive.ph/2024.03.28-185910/https://github.com/nodejs/undici/issues/1531 "fetch times out in under 5 seconds · Issue #1531 · nodejs/undici · GitHub | github.com"
