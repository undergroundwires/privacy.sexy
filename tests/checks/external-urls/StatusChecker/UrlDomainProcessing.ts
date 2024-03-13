export function groupUrlsByDomain(urls: string[]): string[][] {
  const domains = new Set<string>();
  const urlsWithDomain = urls.map((url) => ({
    url,
    domain: getDomainFromUrl(url),
  }));
  for (const url of urlsWithDomain) {
    domains.add(url.domain);
  }
  return Array.from(domains).map((domain) => {
    return urlsWithDomain
      .filter((url) => url.domain.toLowerCase() === domain.toLowerCase())
      .map((url) => url.url);
  });
}

export function getDomainFromUrl(url: string): string {
  return new URL(url).host;
}
