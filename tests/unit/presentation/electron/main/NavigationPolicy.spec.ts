import {
  describe, expect, it, vi,
} from 'vitest';
import {
  ExternalUrlOpenResult,
  configureNavigationPolicy,
  openExternalWebUrl,
  type NavigationPolicyDependencies,
  type NavigationWebContents,
  type NavigationWindowOpenHandler,
  type WillNavigateHandler,
} from '@/presentation/electron/main/NavigationPolicy';

describe('openExternalWebUrl', () => {
  it.each([
    'mailto:security@example.com',
    'file:///sensitive-file',
    // eslint-disable-next-line no-script-url -- Rejected input fixture.
    'javascript:alert(1)',
    'custom-protocol:value',
    'https://user:password@example.com',
    'not a URL',
  ])('rejects %s without invoking the opener', async (url) => {
    // arrange
    const context = new NavigationPolicyTestContext();
    // act
    const result = await openExternalWebUrl(url, context.dependencies);
    // assert
    expect(result).to.equal(ExternalUrlOpenResult.Rejected);
    expect(context.openedUrls).to.deep.equal([]);
  });

  it('opens canonicalized HTTPS URL', async () => {
    // arrange
    const context = new NavigationPolicyTestContext();
    // act
    const result = await openExternalWebUrl('HTTPS://EXAMPLE.COM/docs', context.dependencies);
    // assert
    expect(result).to.equal(ExternalUrlOpenResult.Opened);
    expect(context.openedUrls).to.deep.equal(['https://example.com/docs']);
  });

  it('reports opener failures without rejecting', async () => {
    // arrange
    const openError = new Error('native opener failed');
    const context = new NavigationPolicyTestContext()
      .withOpenExternal(() => Promise.reject(openError));
    // act
    const result = await openExternalWebUrl('https://example.com', context.dependencies);
    // assert
    expect(result).to.equal(ExternalUrlOpenResult.Failed);
    expect(context.loggedErrors).to.deep.equal([
      ['Failed to open external web URL', { error: openError }],
    ]);
  });
});

describe('configureNavigationPolicy', () => {
  it('denies every new window while opening allowed URLs externally', async () => {
    // arrange
    const context = new NavigationPolicyTestContext();
    // act
    configureNavigationPolicy(context.webContents, context.dependencies);
    const result = context.windowOpenHandler({ url: 'http://example.com' });
    await Promise.resolve();
    // assert
    expect(result).to.deep.equal({ action: 'deny' });
    expect(context.openedUrls).to.deep.equal(['http://example.com/']);
  });

  it('prevents same-window navigation and only opens allowed URLs externally', async () => {
    // arrange
    const context = new NavigationPolicyTestContext();
    configureNavigationPolicy(context.webContents, context.dependencies);
    const navigationEvent = { url: 'https://example.com/docs', preventDefault: vi.fn() };
    // act
    context.willNavigateHandler(navigationEvent);
    await Promise.resolve();
    // assert
    expect(navigationEvent.preventDefault).toHaveBeenCalledOnce();
    expect(context.openedUrls).to.deep.equal(['https://example.com/docs']);
  });

  it('prevents same-window navigation without opening rejected URLs', async () => {
    // arrange
    const context = new NavigationPolicyTestContext();
    configureNavigationPolicy(context.webContents, context.dependencies);
    const navigationEvent = { url: 'file:///sensitive-file', preventDefault: vi.fn() };
    // act
    context.willNavigateHandler(navigationEvent);
    await Promise.resolve();
    // assert
    expect(navigationEvent.preventDefault).toHaveBeenCalledOnce();
    expect(context.openedUrls).to.deep.equal([]);
  });
});

class NavigationPolicyTestContext {
  private openExternal: (url: string) => Promise<void> = async (url) => {
    this.openedUrls.push(url);
  };

  public readonly openedUrls = new Array<string>();

  public readonly loggedErrors = new Array<readonly unknown[]>();

  public readonly webContents: NavigationWebContents = {
    setWindowOpenHandler: (handler) => {
      this.windowOpenHandler = handler;
    },
    on: (_, handler) => {
      this.willNavigateHandler = handler;
    },
  };

  public windowOpenHandler: NavigationWindowOpenHandler = () => ({ action: 'deny' });

  public willNavigateHandler: WillNavigateHandler = () => {};

  public get dependencies(): NavigationPolicyDependencies {
    return {
      openExternal: (url) => this.openExternal(url),
      logger: {
        error: (...parameters) => this.loggedErrors.push(parameters),
      },
    };
  }

  public withOpenExternal(openExternal: (url: string) => Promise<void>): this {
    this.openExternal = openExternal;
    return this;
  }
}
