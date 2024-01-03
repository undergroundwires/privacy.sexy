import { OperatingSystem } from '@/domain/OperatingSystem';
import { determineTouchSupportOptions } from '@tests/integration/shared/TestCases/TouchSupportOptions';

interface BrowserOsTestCase {
  readonly userAgent: string;
  readonly platformTouchSupport: boolean;
  readonly expectedOs: OperatingSystem;
}

export const BrowserOsTestCases: ReadonlyArray<BrowserOsTestCase> = [
  ...createTests({
    operatingSystem: OperatingSystem.Windows,
    userAgents: [
      // Internet Explorer:
      'Mozilla/5.0 (Windows NT 6.3; Win64, x64; Trident/7.0; rv:11.0) like Gecko',
      'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Win64; x64; Trident/6.0)',
      'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)',
      'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)',
      // Edge (Legacy):
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/18.17763',
      'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/17.17134',
      'Mozilla/5.0 (Windows NT 10.0; WebView/3.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299',
      // Edge (Chromium):
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
      // Firefox:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0',
      'Mozilla/5.0 (Windows NT 6.4; WOW64; rv:32.0) Gecko/20100101 Firefox/32.0',
      // Chrome/Brave/QQ Browser:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
      // Opera:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 OPR/105.0.0.0',
      'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.52 Safari/537.36 OPR/15.0.1147.100',
      'Opera/9.80 (Windows NT 6.0) Presto/2.12.388 Version/12.14',
      'Opera/9.80 (Windows NT 6.0; U; en) Presto/2.2.15 Version/10.10',
      'Opera/9.27 (Windows NT 5.1; U; en)',
      'Opera/9.80 (Windows NT 6.1; Opera Tablet/15165; U; en) Presto/2.8.149 Version/11.1',
      // UC Browser:
      'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 UBrowser/6.0.1308.1016 Safari/537.36',
      // Electron:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.54 Electron/27.0.0 Safari/537.36',
    ],
  }),
  ...createTests({
    operatingSystem: OperatingSystem.macOS,
    userAgents: [
      // Firefox:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/119.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:66.0) Gecko/20100101 Firefox/66.0',
      // Chrome/Brave:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36',
      // Safari:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0.3 Safari/605.1.15',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
      // Opera:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 OPR/105.0.0.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.82 Safari/537.36 OPR/29.0.1795.41 (Edition beta)',
      // Edge:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
      // Electron:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.54 Electron/27.0.0 Safari/537.36',
    ],
  }),
  ...createTests({
    operatingSystem: OperatingSystem.Linux,
    userAgents: [
      // Firefox:
      'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/116.0',
      'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:66.0) Gecko/20100101 Firefox/66.0',
      // Chrome:
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      // Edge:
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.188',
      // Electron:
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.54 Electron/27.0.0 Safari/537.36',
    ],
  }),
  ...createTests({
    operatingSystem: OperatingSystem.iOS,
    userAgents: [
      ...[ // iPhone
        // Safari:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 12_1_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1',
        // Chrome:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/119.0.6045.109 Mobile/15E148 Safari/604.1',
        // Firefox:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 8_3 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) FxiOS/1.0 Mobile/12F69 Safari/600.1.4',
        // Firefox Focus:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 12_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/7.0.4 Mobile/16B91 Safari/605.1.15',
        // Opera Mini:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) OPiOS/16.0.15.124050 Mobile/15E148 Safari/9537.53',
        // Opera Touch (discontinued):
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_7_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.7 Mobile/15E148 Safari/604.1 OPT/4.3.2',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 15_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) OPT/3.3.3 Mobile/15E148',
      ],
      ...[ // iPod
        // Safari:
        'Mozilla/5.0 (iPod; U; CPU iPhone OS 4_3_2 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8H7 Safari/6533.18.5',
        'Mozilla/5.0 (iPod; CPU iPhone OS 9_3 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13E233 Safari/601.1',
        // Chrome:
        'Mozilla/5.0 (iPod; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/87.0.4280.77 Mobile/15E148 Safari/604.1',
      ],
    ],
  }),
  ...createTests({
    operatingSystem: OperatingSystem.iPadOS,
    userAgents: [
      /*
        `iPad` might be included in user agents on older iPad that's running iOS (not iPadOS),
        to avoid additional complexity, we just detect them as iPadOS.
      */
      // Safari on iPad (running iOS):
      'Mozilla/5.0 (iPad; U; CPU OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B367 Safari/531.21.10',
      // Edge on iOS:
      'Mozilla/5.0 (iPad; CPU OS 17_0_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 EdgiOS/46.2.0 Mobile/15E148 Safari/605.1.15',
      // Safari on iPad Mini (running iPadOS):
      'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    ],
  }),
  ...createTests({
    operatingSystem: OperatingSystem.iPadOS,
    // Safari on (≥ iPadOS 13) and iPhone on desktop mode reports user agents identical to macOS
    userAgents: [
      // Safari:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10156) AppleWebKit/605.1.15 (KHTML, like Gecko)',
    ],
  }),
  ...createTests({
    operatingSystem: OperatingSystem.ChromeOS,
    userAgents: [
      // Chrome:
      'Mozilla/5.0 (X11; CrOS x86_64 11316.165.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.122 Safari/537.36',
      'Mozilla/5.0 (X11; CrOS armv7l 4537.56.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1599.38 Safari/537.36',
    ],
  }),
  ...createTests({
    operatingSystem: OperatingSystem.Android,
    userAgents: [
      // Opera Mini:
      'Opera/9.80 (Android; Opera Mini/32.0/88.150; U; sr) Presto/2.12 Version/12.16',
      'Opera/9.80 (Android; Opera Mini/8.0.1807/36.1609; U; en) Presto/2.12.423 Version/12.16',
      'Opera/9.80 (Android 2.2; Opera Mobi/-2118645896; U; pl) Presto/2.7.60 Version/10.5',
      // Chrome:
      'Mozilla/5.0 (Linux; Android 4.4.4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.52 Safari/537.36 Mobile OPR/15.0.1147.100',
      'Mozilla/5.0 (Linux; Android 9; SM-G960U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Mobile Safari/537.36',
      'Mozilla/5.0 (Linux; Android 6.0; CAM-L03) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.99 Mobile Safari/537.36',
      'Mozilla/5.0 (Linux; Android 5.1.1; Nexus 6 Build/LYZ28E) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.76 Mobile Safari/537.36',
      'Mozilla/5.0 (Linux; Android 4.4.2; Nexus 4 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.76 Mobile Safari/537.36',
      'Mozilla/5.0 (Linux; Android 4.2.2; GT-I9505 Build/JDQ39) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.76 Mobile Safari/537.36',
      'Mozilla/5.0 (Linux; Android 4.3; Nexus 10 Build/JSS15Q) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.76 Safari/537.36',
      'Mozilla/5.0 (Linux; U; Android 4.4.2; en-us; LGMS323 Build/KOT49I.MS32310c) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/46.0.2490.76 Mobile Safari/537.36',
      'Mozilla/5.0 (Linux; Android 9; ONEPLUS A6003) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Mobile Safari/537.36',
      // Firefox:
      'Mozilla/5.0 (Android 4.4; Tablet; rv:41.0) Gecko/41.0 Firefox/41.0',
      'Mozilla/5.0 (Android 4.4; Mobile; rv:41.0) Gecko/41.0 Firefox/41.0',
      'Mozilla/5.0 (Android; Mobile; rv:40.0) Gecko/40.0 Firefox/40.0',
      'Mozilla/5.0 (Android; Tablet; rv:40.0) Gecko/40.0 Firefox/40.0',
      // Firefox Focus:
      'Mozilla/5.0 (Linux; Android 7.0) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Focus/1.0 Chrome/59.0.3029.83 Mobile Safari/537.36',
      'Mozilla/5.0 (Linux; Android 7.0) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Focus/1.0 Chrome/59.0.3029.83 Safari/537.36',
      'Mozilla/5.0 (Android 7.0; Mobile; rv:62.0) Gecko/62.0 Firefox/62.0',
      // Firefox Klar (german edition):
      'Mozilla/5.0 (Linux; Android 7.0) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Klar/1.0 Chrome/58.0.3029.83 Mobile Safari/537.36',
      'Mozilla/5.0 (Linux; Android 7.0) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Focus/4.1 Chrome/62.0.3029.83 Mobile Safari/537.36',
      'Mozilla/5.0 (Android 7.0; Mobile; rv:62.0) Gecko/62.0 Firefox/62.0',
      // UC Browser:
      'Mozilla/5.0 (Linux; U; Android 6.0; en-US; CPH1609 Build/MRA58K) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.108 UCBrowser/12.10.2.1164 Mobile Safari/537.36',
      'UCWEB/2.0 (Linux; U; Adr 5.1; en-US; Lenovo Z90a40 Build/LMY47O) U2/1.0.0 UCBrowser/11.1.5.890 U2/1.0.0 Mobile',
      'Mozilla/5.0 (Linux; U; Android 5.1; en-US; Lenovo Z90a40 Build/LMY47O) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 UCBrowser/11.1.5.890 U3/0.8.0 Mobile Safari/534.30',
      'Mozilla/5.0 (Linux; U; Android 2.3; zh-CN; MI-ONEPlus) AppleWebKit/534.13 (KHTML, like Gecko) UCBrowser/8.6.0.199 U3/0.8.0 Mobile Safari/534.13',
      'UCWEB/2.0 (Linux; U; Adr 2.3; en-US; MI-ONEPlus) U2/1.0.0 UCBrowser/8.6.0.199 U2/1.0.0 Mobile',
      // Opera:
      'Mozilla/5.0 (Linux; Android 2.3.4; MT11i Build/4.0.2.A.0.62) AppleWebKit/537.22 (KHTML, like Gecko) Chrome/25.0.1364.123 Mobile Safari/537.22 OPR/14.0.1025.52315',
      // Opera Touch (discontinued):
      'Mozilla/5.0 (Linux; Android 8.1.0; BBF100-6 Build/OPM1.171019.026) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/68.0.3440.91 Mobile Safari/537.36 OPT/6B8575B',
      // Samsung Browser:
      'Mozilla/5.0 (Linux; Android 9; SAMSUNG SM-G965F Build/PPR1.180610.011) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/9.0 Chrome/67.0.3396.87 Mobile Safari/537.36',
      'Mozilla/5.0 (Linux; Android 8.0.0; SAMSUNG SM-G955U Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/8.2 Chrome/63.0.3239.111 Mobile Safari/537.36',
      // QQ Browser:
      'Mozilla/5.0 (Linux; U; Android 8.1.0; zh-cn; vivo X21A Build/OPM1.171019.011) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.132 MQQBrowser/9.1 Mobile Safari/537.36',
      'Mozilla/5.0 (Linux; U; Android 4.4.2; zh-cn; GT-I9500 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko)Version/4.0 MQQBrowser/5.0 QQ-URL-Manager Mobile Safari/537.36',
      // Vivo Browser:
      'Mozilla/5.0 (Linux; Android 10; V1990A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/87.0.4280.141 Mobile Safari/537.36 VivoBrowser/10.3.10.0',
      // Android Generic Webkit based:
      'Mozilla/5.0 (Linux; U; Android 4.4.4; pt-br; SM-G530BT Build/KTU84P) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30',
      'Mozilla/5.0 (Linux; U; Android 4.4.2; zh-cn; Q40; Android/4.4.2; Release/12.15.2015) AppleWebKit/534.30 (KHTML, like Gecko) Mobile Safari/534.30',
      'Mozilla/5.0 (Linux; U; Android 4.3; en-us; SM-N900T Build/JSS15J) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30',
    ],
  }),
  ...createTests({
    operatingSystem: OperatingSystem.BlackBerry10,
    userAgents: [
      // BlackBerry Browser:
      'Mozilla/5.0 (BB10; Touch) AppleWebKit/537.10+ (KHTML, like Gecko) Version/10.1.0.1429 Mobile Safari/537.10+',
    ],
  }),
  ...createTests({
    operatingSystem: OperatingSystem.BlackBerryTabletOS,
    userAgents: [
      // BlackBerry Browser:
      'Mozilla/5.0 (PlayBook; U; RIM Tablet OS 2.0.0; en-US) AppleWebKit/535.8+ (KHTML, like Gecko) Version/7.2.0.0 Safari/535.8+',
    ],
  }),
  ...createTests({
    operatingSystem: OperatingSystem.BlackBerryOS,
    userAgents: [
      // BlackBerry Browser:
      'Mozilla/5.0 (BlackBerry; U; BlackBerry 9800; en-US) AppleWebKit/534.8+ (KHTML, like Gecko) Version/6.0.0.466 Mobile Safari/534.8+',
    ],
  }),
  ...createTests({
    operatingSystem: OperatingSystem.WindowsPhone,
    userAgents: [
      // Internet Explorer Mobile:
      'Mozilla/5.0 (Mobile; Windows Phone 8.1; Android 4.0; ARM; Trident/7.0; Touch; rv:11.0; IEMobile/11.0; NOKIA; Lumia 625) like iPhone OS 7_0_3 Mac OS X AppleWebKit/537 (KHTML, like Gecko) Mobile Safari/537',
      'Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0; Trident/6.0; IEMobile/10.0; ARM; Touch; NOKIA; Lumia 920)',
      'Mozilla/5.0 (Windows Phone 8.1; ARM; Trident/7.0; Touch; rv:11.0; IEMobile/11.0; NOKIA; id313-3) like Gecko',
      'Mozilla/5.0 (compatible; MSIE 9.0; Windows Phone OS 7.5; Trident/5.0; IEMobile/9.0; NOKIA; Lumia 900)',
    ],
  }),
  ...createTests({
    operatingSystem: OperatingSystem.Windows10Mobile,
    userAgents: [
      // Chrome:
      'Mozilla/5.0 (Windows Mobile 13; Android 10.0; Microsoft; Lumia 950XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36 Safari/537.36',
      // Opera Mini:
      'Opera/9.80 (Windows Mobile; Opera Mini/103.1.21595/25.657; U; en) Presto/2.5.25 Version/10.54',
      // Edge 100:
      'Mozilla/5.0 (compatible; Android 10.0;SM-G973F; Windows Mobile 10.0; Chrome/106.0.5249.126 ) AppleWebKit/535.1 (KHTML, like Gecko) EdgA/100/0.1185.50 Mobile Safari/535.1 3gpp-gba',
      // Edge legacy:
      'Mozilla/5.0 (Windows Phone 10.0; Android 5.1.1; NOKIA; Lumia 1520) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Mobile Safari/537.36 Edge/13.10586',
      // Firefox:
      'Mozilla/5.0 (Windows Phone 10.0; Mobile; rv:107.0) Gecko/107.0 Firefox/107.0',
    ],
  }),
  ...createTests({
    operatingSystem: OperatingSystem.KaiOS,
    userAgents: [
      // Firefox:
      'Mozilla/5.0 (Mobile; LYF/F90M/LYF_F90M_000-03-12-110119; Android; rv:48.0) Gecko/48.0 Firefox/48.0 KAIOS/2.5',
    ],
  }),
];

function createTests(testScenario: {
  readonly operatingSystem: OperatingSystem,
  readonly userAgents: readonly string[],
}): BrowserOsTestCase[] {
  return determineTouchSupportOptions(testScenario.operatingSystem)
    .flatMap((hasTouch): readonly BrowserOsTestCase[] => testScenario
      .userAgents.map((userAgent): BrowserOsTestCase => ({
        userAgent,
        platformTouchSupport: hasTouch,
        expectedOs: testScenario.operatingSystem,
      })));
}
