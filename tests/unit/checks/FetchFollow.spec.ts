import {
  afterEach, describe, expect, it, vi,
} from 'vitest';
import { fetchFollow } from '@tests/checks/external-urls/StatusChecker/FetchFollow';

describe('fetchFollow', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    ['/target', 'https://example.com/target'],
    ['target', 'https://example.com/path/target'],
    ['//other.example/target', 'https://other.example/target'],
    ['https://other.example/target', 'https://other.example/target'],
  ])('resolves redirect %s against the current URL', async (location, expectedUrl) => {
    // arrange
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 302, headers: { location } }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);
    // act
    const response = await fetchFollow('https://example.com/path/start', 1000);
    // assert
    expect(response.status).to.equal(204);
    expect(fetchMock).toHaveBeenNthCalledWith(2, expectedUrl, expect.objectContaining({
      headers: { Host: new URL(expectedUrl).host },
    }));
  });

  it('rejects a redirect loop at the configured limit', async () => {
    // arrange
    const fetchMock = vi.fn<typeof fetch>()
      .mockImplementation(async () => new Response(null, {
        status: 302,
        headers: { location: '/loop' },
      }));
    vi.stubGlobal('fetch', fetchMock);
    // act
    const result = fetchFollow('https://example.com/loop', 1000, undefined, {
      maximumRedirectFollowDepth: 2,
    });
    // assert
    await expect(result).rejects.toThrow('[max-redirect]');
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
