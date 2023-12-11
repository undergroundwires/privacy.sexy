import { IRuntimeEnvironment } from '@/infrastructure/RuntimeEnvironment/IRuntimeEnvironment';
import { RuntimeEnvironment } from '@/infrastructure/RuntimeEnvironment/RuntimeEnvironment';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { Bootstrapper } from '../Bootstrapper';

export class MobileSafariActivePseudoClassEnabler implements Bootstrapper {
  constructor(
    private readonly currentEnvironment = RuntimeEnvironment.CurrentEnvironment,
    private readonly browser: BrowserAccessor = GlobalBrowserAccessor,
  ) {

  }

  public async bootstrap(): Promise<void> {
    if (!isMobileSafari(this.currentEnvironment, this.browser.getNavigatorUserAgent())) {
      return;
    }
    /*
      Workaround to fix issue with `:active` pseudo-class not working on mobile Safari.
      This is required so `hover-or-touch` mixin works properly.
      Last tested: iPhone with iOS 17.1.1
      See:
        - Source: https://stackoverflow.com/a/33681490
        - Snapshot 1: https://web.archive.org/web/20231112151701/https://stackoverflow.com/questions/3885018/active-pseudo-class-doesnt-work-in-mobile-safari/33681490#33681490
        - Snapshot 2: tps://archive.ph/r1zpJ
    */
    this.browser.addWindowEventListener('touchstart', () => {}, {
      /*
        - Setting to `true` removes the need for scrolling to block on touch and wheel
          event listeners.
        - If set to `true`, it indicates that the function specified by listener will
          never call `preventDefault`.
        - Defaults to `true` on Safari for `touchstart`.
      */
      passive: true,
    });
  }
}

export interface BrowserAccessor {
  getNavigatorUserAgent(): string;
  addWindowEventListener(...args: Parameters<typeof window.addEventListener>): void;
}

function isMobileSafari(environment: IRuntimeEnvironment, userAgent: string): boolean {
  if (!isMobileAppleOperatingSystem(environment)) {
    return false;
  }
  return isSafari(userAgent);
}

function isMobileAppleOperatingSystem(environment: IRuntimeEnvironment): boolean {
  if (environment.os === undefined) {
    return false;
  }
  if (![OperatingSystem.iOS, OperatingSystem.iPadOS].includes(environment.os)) {
    return false;
  }
  return true;
}

function isSafari(userAgent: string): boolean {
  if (!userAgent) {
    return false;
  }
  return SafariUserAgentIdentifiers.every((i) => userAgent.includes(i))
    && NonSafariBrowserIdentifiers.every((i) => !userAgent.includes(i));
}

const GlobalBrowserAccessor: BrowserAccessor = {
  getNavigatorUserAgent: () => navigator.userAgent,
  addWindowEventListener: (...args) => window.addEventListener(...args),
} as const;

const SafariUserAgentIdentifiers = [
  'Safari',
] as const;

const NonSafariBrowserIdentifiers = [
  // Chrome:
  'Chrome',
  'CriOS',
  // Firefox:
  'FxiOS',
  // Opera:
  'OPiOS',
  'OPR', // Opera Desktop and Android
  'Opera', // Opera Mini
  'OPT',
  // Edge:
  'EdgiOS', // Edge on iOS/iPadOS
  'Edg', // Edge on macOS
  'EdgA', // Edge on Android
  'Edge', // Microsoft Edge Legacy
  // UC Browser:
  'UCBrowser',
  // Baidu:
  'BaiduHD',
  'BaiduBrowser',
  'baiduboxapp',
  'baidubrowser',
  // QQ Browser:
  'MQQBrowser',
] as const;
