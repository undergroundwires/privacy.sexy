import { OperatingSystem } from '@/domain/OperatingSystem';
import { determineTouchSupportOptions } from '@tests/integration/shared/TestCases/TouchSupportOptions';

interface PlatformTestCase {
  readonly description: string;
  readonly userAgent: string;
  readonly supportsTouch: boolean;
  readonly expectedResult: boolean;
}

export const MobileSafariDetectionTestCases: ReadonlyArray<PlatformTestCase> = [
  ...createBrowserTestCases({
    browserName: 'Safari',
    expectedResult: true,
    userAgents: [
      {
        deviceInfo: 'Safari on iPad (≥ 13)',
        operatingSystem: OperatingSystem.iPadOS,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15', // same as macOS (desktop)
        supportsTouch: true,
      },
      {
        deviceInfo: 'Safari on iPad (< 13)',
        operatingSystem: OperatingSystem.iPadOS,
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B14 3 Safari/601.1',
      },
      {
        deviceInfo: 'Safari on iPhone',
        operatingSystem: OperatingSystem.iOS,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
      },
      {
        deviceInfo: 'Safari on iPod touch',
        operatingSystem: OperatingSystem.iOS,
        userAgent: 'Mozila/5.0 (iPod; U; CPU like Mac OS X; en) AppleWebKit/420.1 (KHTML, like Geckto) Version/3.0 Mobile/3A101a Safari/419.3',
        // https://web.archive.org/web/20231112165804/https://www.cnet.com/tech/mobile/safari-for-ipod-touch-has-different-user-agent-string-may-not-go-directly-to-iphone-optimized-sites/null/
      },
    ],
  }),
  ...createBrowserTestCases({
    browserName: 'Safari',
    expectedResult: false,
    userAgents: [
      {
        deviceInfo: 'Safari on macOS',
        operatingSystem: OperatingSystem.macOS,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
        supportsTouch: false,
      },
    ],
  }),
  ...createBrowserTestCases({
    browserName: 'Chrome',
    expectedResult: false,
    userAgents: [
      {
        deviceInfo: 'macOS',
        operatingSystem: OperatingSystem.macOS,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      },
      {
        deviceInfo: 'macOS (Electron)',
        operatingSystem: OperatingSystem.macOS,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.54 Electron/27.0.0 Safari/537.36',
      },
      {
        deviceInfo: 'iPad (iPadOS 17)',
        operatingSystem: OperatingSystem.iPadOS,
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/119.0.6045.109 Mobile/15E148 Safari/604.1',
      },
      {
        deviceInfo: 'iPhone (iOS 17)',
        operatingSystem: OperatingSystem.iOS,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/119.0.6045.109 Mobile/15E148 Safari/604.1',
      },
      {
        deviceInfo: 'iPhone (iOS 12)',
        operatingSystem: OperatingSystem.iOS,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/70.0.3538.75 Mobile/15E148 Safari/605.1',
      },
      {
        deviceInfo: 'iPod Touch (iOS 12)',
        operatingSystem: OperatingSystem.iOS,
        userAgent: 'Mozilla/5.0 (iPod; CPU iPhone OS 12_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/86.0.4240.93 Mobile/15E148 Safari/604.1',
      },
    ],
  }),
  ...createBrowserTestCases({
    browserName: 'Firefox',
    expectedResult: false,
    userAgents: [
      {
        deviceInfo: 'macOS',
        operatingSystem: OperatingSystem.macOS,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.1; rv:119.0) Gecko/20100101 Firefox/119.0',
      },
      {
        deviceInfo: 'iPad (iPadOS 13)',
        operatingSystem: OperatingSystem.iPadOS,
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/19.1b16203 Mobile/15E148 Safari/605.1.15',
      },
      {
        deviceInfo: 'iPhone (iOS 17)',
        operatingSystem: OperatingSystem.iOS,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/117.2 Mobile/15E148 Safari/605.1.15',
      },
    ],
  }),
  ...createBrowserTestCases({
    browserName: 'Edge',
    expectedResult: false,
    userAgents: [
      {
        deviceInfo: 'macOS',
        operatingSystem: OperatingSystem.macOS,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36 Edg/117.0.2045.55',
      },
      {
        deviceInfo: 'iPad (iPadOS 15)',
        operatingSystem: OperatingSystem.iPadOS,
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/96.0.1054.61 Version/15.0 Mobile/15E148 Safari/604.1',
      },
      {
        deviceInfo: 'iPhone (iOS 17)',
        operatingSystem: OperatingSystem.iOS,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/118.0.2088.81 Version/17.0 Mobile/15E148 Safari/604.1',
      },
    ],
  }),
  ...createBrowserTestCases({
    browserName: 'Opera',
    expectedResult: false,
    userAgents: [
      {
        deviceInfo: 'Opera Mini on iPhone',
        operatingSystem: OperatingSystem.iOS,
        userAgent: 'Opera/9.80 (iPhone; Opera Mini/5.0.0176/764; U; en) Presto/2.4.15',
        // https://web.archive.org/web/20140221034354/http://my.opera.com/haavard/blog/2010/04/16/iphone-user-agent
      },
      {
        deviceInfo: 'Opera Mini (Opera Turbo) on iPhone',
        operatingSystem: OperatingSystem.iOS,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 7_1_1 like Mac OS X) AppleWebKit/537.51.2 (KHTML, like Gecko) OPiOS/8.0.0.78129 Mobile/11D201 Safari/9537.53',
        // https://web.archive.org/web/20231112164709/https://dev.opera.com/blog/opera-mini-8-for-ios/
      },
      {
        deviceInfo: 'Opera on macOS',
        operatingSystem: OperatingSystem.macOS,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36 OPR/94.0.0.0',
        // https://web.archive.org/web/20231112164741/https://forums.opera.com/topic/59600/have-the-user-agent-browser-identification-match-with-the-mac-os-version-the-browser-is-running-on
      },
      {
        deviceInfo: 'Opera on macOS (legacy)',
        operatingSystem: OperatingSystem.macOS,
        userAgent: 'Opera/9.80 (Macintosh; Intel Mac OS X 10.8; U; ru) Presto/2.10 Version/12.00',
        // https://web.archive.org/web/20231112164741/https://forums.opera.com/topic/59600/have-the-user-agent-browser-identification-match-with-the-mac-os-version-the-browser-is-running-on
      },
      {
        deviceInfo: 'Opera Touch on iPhone',
        operatingSystem: OperatingSystem.iOS,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) OPT/3.3.3 Mobile/15E148',
      },
      {
        deviceInfo: 'Opera Mini on iPhone',
        operatingSystem: OperatingSystem.iOS,
        userAgent: 'Opera/9.80 (iPhone; Opera Mini/14.0.0/37.8603; U; en) Presto/2.12.423 Version/12.16',
      },
      {
        deviceInfo: 'Opera Mini on iPad',
        operatingSystem: OperatingSystem.iPadOS,
        userAgent: 'Opera/9.80 (iPad; Opera Mini/7.0.5/191.320; U; id) Presto/2.12.423 Version/12.16',
      },
    ],
  }),
  ...createBrowserTestCases({
    browserName: 'Vivo Browser', // Runs only Vivo (Android) devices
    expectedResult: false,
    userAgents: [
      {
        deviceInfo: 'VivoBrowser on Android',
        operatingSystem: OperatingSystem.Android,
        userAgent: 'Mozilla/5.0 (Linux; Android 10; V1990A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/87.0.4280.141 Mobile Safari/537.36 VivoBrowser/10.3.10.0',
      },
    ],
  }),
];

interface UserAgentTestScenario {
  readonly userAgent: string;
  readonly operatingSystem: OperatingSystem;
  readonly deviceInfo: string;
  readonly supportsTouch?: boolean;
}

interface BrowserTestScenario {
  readonly browserName: string;
  readonly expectedResult: boolean;
  readonly userAgents: readonly UserAgentTestScenario[];
}

function createBrowserTestCases(
  scenario: BrowserTestScenario,
): PlatformTestCase[] {
  return scenario.userAgents.flatMap((agentInfo): readonly PlatformTestCase[] => {
    const touchCases = agentInfo.supportsTouch === undefined
      ? determineTouchSupportOptions(agentInfo.operatingSystem)
      : [agentInfo.supportsTouch];
    return touchCases.map((hasTouch): PlatformTestCase => ({
      description: [
        scenario.expectedResult ? '[POSITIVE]' : '[NEGATIVE]',
        scenario.browserName,
        OperatingSystem[agentInfo.operatingSystem],
        agentInfo.deviceInfo,
        hasTouch === true ? '[TOUCH]' : '[NO TOUCH]',
      ].join(' | '),
      userAgent: agentInfo.userAgent,
      supportsTouch: hasTouch,
      expectedResult: scenario.expectedResult,
    }));
  });
}
