import { OperatingSystem } from '@/domain/OperatingSystem';
import { type BrowserAccessor, MobileSafariActivePseudoClassEnabler } from '@/presentation/bootstrapping/Modules/MobileSafariActivePseudoClassEnabler';
import { RuntimeEnvironmentStub } from '@tests/unit/shared/Stubs/RuntimeEnvironmentStub';

describe('MobileSafariActivePseudoClassEnabler', () => {
  describe('bootstrap', () => {
    it('when environment is not iOS or iPadOS', () => {
      // arrange
      const operatingSystem = OperatingSystem.Android;
      // act
      const { isBootstrapped } = testBootstrap({
        operatingSystem,
      });
      // assert
      expect(isBootstrapped).to.equal(false);
    });
    describe('for Apple mobile operating systems', () => {
      // arrange
      const appleMobileOperatingSystems = [OperatingSystem.iOS, OperatingSystem.iPadOS];
      appleMobileOperatingSystems.forEach((operatingSystem) => {
        describe(`when operating system is ${OperatingSystem[operatingSystem]}`, () => {
          describe('when browser is not Safari', () => {
            UserAgents.nonSafariUserAgents.forEach((nonSafariUserAgent) => {
              it(`ignores non-Safari user agent: "${nonSafariUserAgent}"`, () => {
                // act
                const { isBootstrapped } = testBootstrap({
                  operatingSystem,
                  userAgent: nonSafariUserAgent,
                });
                // assert
                expect(isBootstrapped).to.equal(false);
              });
            });
          });
          describe('when browser is Safari', () => {
            UserAgents.safariUserAgents.forEach((safariUserAgent) => {
              it(`activates for Safari user agent: "${safariUserAgent}"`, () => {
                // act
                const { isBootstrapped } = testBootstrap({
                  operatingSystem,
                  userAgent: safariUserAgent,
                });
                // assert
                expect(isBootstrapped).to.equal(true);
              });
            });
          });
        });
      });
    });
  });
});

function testBootstrap(options?: {
  operatingSystem?: OperatingSystem,
  userAgent?: string,
}) {
  // arrange
  let isBootstrapped = false;
  const browser: BrowserAccessor = {
    getNavigatorUserAgent: () => options?.userAgent ?? UserAgents.nonSafariUserAgents[0],
    addWindowEventListener: (type) => {
      isBootstrapped = type === 'touchstart';
    },
  };
  const environment = new RuntimeEnvironmentStub().withOs(
    options?.operatingSystem ?? OperatingSystem.macOS,
  );
  // act
  const sut = new MobileSafariActivePseudoClassEnabler(environment, browser);
  sut.bootstrap();
  // assert
  return { isBootstrapped };
}

const UserAgents: {
  readonly safariUserAgents: readonly string[];
  readonly nonSafariUserAgents: readonly string[];
} = {
  safariUserAgents: [
    // macOS / iPad
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    // iPhone
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    // iPad mini
    'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  ],
  nonSafariUserAgents: [
    ...[ // Apple devices
      // Chrome on macOS
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      // Opera on macOS
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 OPR/105.0.0.0',
      // Edge on macOS
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
      // Firefox on macOS
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/119.0',
      // Firefox Focus on iPhone
      'Mozilla/5.0 (iPhone; CPU iPhone OS 12_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/7.0.4 Mobile/16B91 Safari/605.1.15',
      // Baidu Box App on iPhone
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 SP-engine/2.30.0 main%2F1.0 baiduboxapp/12.13.0.10 (Baidu; P2 16.6.1) NABar/1.0 themeUA=Theme/default',
      // Baidu Browser on iPad
      'Mozilla/5.0 (iPad; CPU OS 13_3_1 like Mac OS X) AppleWebKit/534.46 (KHTML, like Gecko) BaiduHD/5.4.0.0 Mobile/10A406 Safari/8536.25',
      // Baidu Browser on iPhone
      'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_2 like Mac OS X) AppleWebKit/603.2.4 (KHTML, like Gecko) Version/4.0 Chrome/37.0.0.0 Mobile Safari/537.36 baidubrowser/6.3.15.0',
      // Edge on iPad
      'Mozilla/5.0 (iPad; CPU OS 17_0_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 EdgiOS/46.2.0 Mobile/15E148 Safari/605.1.15',
      // Chrome on iPod:
      'Mozilla/5.0 (iPod; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/87.0.4280.77 Mobile/15E148 Safari/604.1',
      // Opera mini on iPhone:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) OPiOS/16.0.15.124050 Mobile/15E148 Safari/9537.53',
      // Opera Touch (discontinued):
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_7_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.7 Mobile/15E148 Safari/604.1 OPT/4.3.2',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 15_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) OPT/3.3.3 Mobile/15E148',
      // Opera Mini on iPad:
      'Opera/9.80 (iPad; Opera Mini/7.0.5/191.283; U; es) Presto/2.12.423 Version/12.16',
      // QQ Browser on iPhone:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 15_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 MQQBrowser/12.9.7 Mobile/15E148 Safari/604.1 QBWebViewUA/2 QBWebViewType/1 WKType/1',
    ],
    ...[ // Non Apple devices
      // Chrome/Brave/QQ Browser on Windows
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      // Firefox on Windows
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0',
      // Edge on Windows
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
      // Opera on Windows
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 OPR/105.0.0.0',
      // UC Browser on Windows
      'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 UBrowser/6.0.1308.1016 Safari/537.36',
      // Opera mini on Android
      'Opera/9.80 (Android; Opera Mini/8.0.1807/36.1609; U; en) Presto/2.12.423 Version/12.16',
      // Vivo Browser on Android,
      'Mozilla/5.0 (Linux; Android 10; V1990A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.84 Mobile Safari/537.36 VivoBrowser/8.4.14.0',
    ],
  ],
} as const;
