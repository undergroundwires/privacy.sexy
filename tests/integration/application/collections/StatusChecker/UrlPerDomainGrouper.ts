export function groupUrlsByDomain(urls: string[]): string[][] {
  const domains = new Set<string>();
  const urlsWithDomain = urls.map((url) => ({
    url,
    domain: extractDomain(url),
  }));
  for (const url of urlsWithDomain) {
    domains.add(url.domain);
  }
  return Array.from(domains).map((domain) => {
    return urlsWithDomain
      .filter((url) => url.domain === domain)
      .map((url) => url.url);
  });
}

function extractDomain(url: string): string {
  return url.split('://')[1].split('/')[0].toLowerCase();
}
