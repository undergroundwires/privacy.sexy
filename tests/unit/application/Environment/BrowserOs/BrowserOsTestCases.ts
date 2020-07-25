import { OperatingSystem } from '@/application/Environment/OperatingSystem';

interface IBrowserOsTestCase {
    userAgent: string;
    expectedOs: OperatingSystem;
}

export const BrowserOsTestCases: ReadonlyArray<IBrowserOsTestCase> = [
    {
        userAgent: 'Mozilla/5.0 (Windows NT 6.3; Win64, x64; Trident/7.0; rv:11.0) like Gecko',
        expectedOs: OperatingSystem.Windows,
    },
    {
        userAgent: 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Win64; x64; Trident/6.0)',
        expectedOs: OperatingSystem.Windows,
    },
    {
        userAgent: 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)',
        expectedOs: OperatingSystem.Windows,
    },
    {
        userAgent: 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.0; Trident/5.0)',
        expectedOs: OperatingSystem.Windows,
    },
    {
        userAgent: 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0; Trident/4.0)',
        expectedOs: OperatingSystem.Windows,
    },
    {
        userAgent: 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)',
        expectedOs: OperatingSystem.Windows,
    },
    {
        userAgent: 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)',
        expectedOs: OperatingSystem.Windows,
    },
    {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/18.17763',
        expectedOs: OperatingSystem.Windows,
    },
    {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/17.17134',
        expectedOs: OperatingSystem.Windows,
    },
    {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; WebView/3.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299',
        expectedOs: OperatingSystem.Windows,
    },
    {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36 Edge/15.15063',
        expectedOs: OperatingSystem.Windows,
    },
    {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.82 Safari/537.36 Edge/14.14316',
        expectedOs: OperatingSystem.Windows,
    },
    {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586',
        expectedOs: OperatingSystem.Windows,
    },
    {
        userAgent: 'Mozilla/5.0 (Windows Phone 10.0; Android 5.1.1; NOKIA; Lumia 1520) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Mobile Safari/537.36 Edge/13.10586',
        expectedOs: OperatingSystem.WindowsPhone,
    },
    {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.10136',
        expectedOs: OperatingSystem.Windows,
    },
    {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:66.0) Gecko/20100101 Firefox/66.0',
        expectedOs: OperatingSystem.Windows,
    },
    {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:66.0) Gecko/20100101 Firefox/66.0',
        expectedOs: OperatingSystem.macOS,
    },
    {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36',
        expectedOs: OperatingSystem.Windows,
    },
    {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36',
        expectedOs: OperatingSystem.macOS,
    },
    {
        userAgent: 'Mozilla/5.0 (X11; CrOS x86_64 11316.165.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.122 Safari/537.36',
        expectedOs: OperatingSystem.ChromeOS,
    },
    {
        userAgent: 'Mozilla/5.0 (X11; CrOS x86_64 8872.76.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.105 Safari/537.36',
        expectedOs: OperatingSystem.ChromeOS,
    },
    {
        userAgent: 'Mozilla/5.0 (X11; CrOS armv7l 4537.56.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1599.38 Safari/537.36',
        expectedOs: OperatingSystem.ChromeOS,
    },
    {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0.3 Safari/605.1.15',
        expectedOs: OperatingSystem.macOS,
    },
    {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.1.2 Safari/605.1.15',
        expectedOs: OperatingSystem.macOS,
    },
    {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36 OPR/58.0.3135.114',
        expectedOs: OperatingSystem.Windows,
    },
    {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.170 Safari/537.36 OPR/53.0.2907.68',
        expectedOs: OperatingSystem.macOS,
    },
    {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2393.94 Safari/537.36 OPR/42.0.2393.94',
        expectedOs: OperatingSystem.Windows,
    },
    {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.82 Safari/537.36 OPR/29.0.1795.41 (Edition beta)',
        expectedOs: OperatingSystem.macOS,
    },
    {
        userAgent: 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.52 Safari/537.36 OPR/15.0.1147.100',
        expectedOs: OperatingSystem.Windows,
    },
    {
        userAgent: 'Opera/9.80 (Windows NT 6.0) Presto/2.12.388 Version/12.14',
        expectedOs: OperatingSystem.Windows,
    },
    {
        userAgent: 'Opera/9.80 (Windows NT 6.0; U; en) Presto/2.2.15 Version/10.10',
        expectedOs: OperatingSystem.Windows,
    },
    {
        userAgent: 'Opera/9.27 (Windows NT 5.1; U; en)',
        expectedOs: OperatingSystem.Windows,
    },
    {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_1_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1',
        expectedOs: OperatingSystem.iOS,
    },
    {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
        expectedOs: OperatingSystem.iOS,
    },
    {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_0 like Mac OS X) AppleWebKit/602.1.38 (KHTML, like Gecko) Version/10.0 Mobile/14A300 Safari/602.1',
        expectedOs: OperatingSystem.iOS,
    },
    {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1',
        expectedOs: OperatingSystem.iOS,
    },
    {
        userAgent: 'Opera/9.80 (Android; Opera Mini/32.0/88.150; U; sr) Presto/2.12 Version/12.16',
        expectedOs: OperatingSystem.Android,
    },
    {
        userAgent: 'Opera/9.80 (Android; Opera Mini/8.0.1807/36.1609; U; en) Presto/2.12.423 Version/12.16',
        expectedOs: OperatingSystem.Android,
    },
    {
        userAgent: 'Mozilla/5.0 (Linux; U; Android 4.4.4; pt-br; SM-G530BT Build/KTU84P) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30',
        expectedOs: OperatingSystem.Android,
    },
    {
        userAgent: 'Mozilla/5.0 (Linux; U; Android 4.4.2; zh-cn; Q40; Android/4.4.2; Release/12.15.2015) AppleWebKit/534.30 (KHTML, like Gecko) Mobile Safari/534.30',
        expectedOs: OperatingSystem.Android,
    },
    {
        userAgent: 'Mozilla/5.0 (Linux; U; Android 4.3; en-us; SM-N900T Build/JSS15J) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30',
        expectedOs: OperatingSystem.Android,
    },
    {
        userAgent: 'Mozilla/5.0 (Linux; U; Android 4.1; en-us; GT-N7100 Build/JRO03C) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30',
        expectedOs: OperatingSystem.Android,
    },
    {
        userAgent: 'Mozilla/5.0 (Linux; U; Android 4.0; en-us; GT-I9300 Build/IMM76D) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30',
        expectedOs: OperatingSystem.Android,
    },
    {
        userAgent: 'Mozilla/5.0 (BB10; Touch) AppleWebKit/537.10+ (KHTML, like Gecko) Version/10.1.0.1429 Mobile Safari/537.10+',
        expectedOs: OperatingSystem.BlackBerry,
    },
    {
        userAgent: 'Mozilla/5.0 (PlayBook; U; RIM Tablet OS 2.0.0; en-US) AppleWebKit/535.8+ (KHTML, like Gecko) Version/7.2.0.0 Safari/535.8+',
        expectedOs: OperatingSystem.BlackBerryTabletOS,
    },
    {
        userAgent: 'Mozilla/5.0 (BlackBerry; U; BlackBerry 9800; en-US) AppleWebKit/534.8+ (KHTML, like Gecko) Version/6.0.0.466 Mobile Safari/534.8+',
        expectedOs: OperatingSystem.BlackBerryOS,
    },
    {
        userAgent: 'Mozilla/5.0 (Linux; Android 4.4.4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.52 Safari/537.36 Mobile OPR/15.0.1147.100',
        expectedOs: OperatingSystem.Android,
    },
    {
        userAgent: 'Mozilla/5.0 (Linux; Android 2.3.4; MT11i Build/4.0.2.A.0.62) AppleWebKit/537.22 (KHTML, like Gecko) Chrome/25.0.1364.123 Mobile Safari/537.22 OPR/14.0.1025.52315',
        expectedOs: OperatingSystem.Android,
    },
    {
        userAgent: 'Opera/9.80 (Windows NT 6.1; Opera Tablet/15165; U; en) Presto/2.8.149 Version/11.1',
        expectedOs: OperatingSystem.Windows,
    },
    {
        userAgent: 'Opera/9.80 (Android 2.2; Opera Mobi/-2118645896; U; pl) Presto/2.7.60 Version/10.5',
        expectedOs: OperatingSystem.Android,
    },
    {
        userAgent: 'Mozilla/5.0 (Linux; Android 9; SM-G960U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Mobile Safari/537.36',
        expectedOs: OperatingSystem.Android,
    },
    {
        userAgent: 'Mozilla/5.0 (Linux; Android 6.0; CAM-L03) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.99 Mobile Safari/537.36',
        expectedOs: OperatingSystem.Android,
    },
    {
        userAgent: 'Mozilla/5.0 (Linux; Android 5.1.1; Nexus 6 Build/LYZ28E) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.76 Mobile Safari/537.36',
        expectedOs: OperatingSystem.Android,
    },
    {
        userAgent: 'Mozilla/5.0 (Linux; Android 4.4.2; Nexus 4 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.76 Mobile Safari/537.36',
        expectedOs: OperatingSystem.Android,
    },
    {
        userAgent: 'Mozilla/5.0 (Linux; Android 4.2.2; GT-I9505 Build/JDQ39) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.76 Mobile Safari/537.36',
        expectedOs: OperatingSystem.Android,
    },
    {
        userAgent: 'Mozilla/5.0 (Linux; Android 4.3; Nexus 10 Build/JSS15Q) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.76 Safari/537.36',
        expectedOs: OperatingSystem.Android,
    },
    {
        userAgent: 'Mozilla/5.0 (Linux; U; Android 4.4.2; en-us; LGMS323 Build/KOT49I.MS32310c) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/46.0.2490.76 Mobile Safari/537.36',
        expectedOs: OperatingSystem.Android,
    },
    {
        userAgent: 'Mozilla/5.0 (Android 9; Mobile; rv:64.0) Gecko/64.0 Firefox/64.0',
        expectedOs: OperatingSystem.Android,
    },
    {
        userAgent: 'Mozilla/5.0 (Android 4.4; Mobile; rv:41.0) Gecko/41.0 Firefox/41.0',
        expectedOs: OperatingSystem.Android,
    },
    {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_3 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) FxiOS/1.0 Mobile/12F69 Safari/600.1.4',
        expectedOs: OperatingSystem.iOS,
    },
    {
        userAgent: 'Mozilla/5.0 (Mobile; Windows Phone 8.1; Android 4.0; ARM; Trident/7.0; Touch; rv:11.0; IEMobile/11.0; NOKIA; Lumia 625) like iPhone OS 7_0_3 Mac OS X AppleWebKit/537 (KHTML, like Gecko) Mobile Safari/537',
        expectedOs: OperatingSystem.WindowsPhone,
    },
    {
        userAgent: 'Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0; Trident/6.0; IEMobile/10.0; ARM; Touch; NOKIA; Lumia 520)',
        expectedOs: OperatingSystem.WindowsPhone,
    },
    {
        userAgent: 'Mozilla/5.0 (Linux; U; Android 6.0; en-US; CPH1609 Build/MRA58K) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.108 UCBrowser/12.10.2.1164 Mobile Safari/537.36',
        expectedOs: OperatingSystem.Android,
    },
    {
        userAgent: 'UCWEB/2.0 (Linux; U; Adr 5.1; en-US; Lenovo Z90a40 Build/LMY47O) U2/1.0.0 UCBrowser/11.1.5.890 U2/1.0.0 Mobile',
        expectedOs: OperatingSystem.Android,
    },
    {
        userAgent: 'Mozilla/5.0 (Linux; U; Android 5.1; en-US; Lenovo Z90a40 Build/LMY47O) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 UCBrowser/11.1.5.890 U3/0.8.0 Mobile Safari/534.30',
        expectedOs: OperatingSystem.Android,
    },
    {
        userAgent: 'UCWEB/2.0 (Linux; U; Adr 2.3; en-US; MI-ONEPlus) U2/1.0.0 UCBrowser/8.6.0.199 U2/1.0.0 Mobile',
        expectedOs: OperatingSystem.Android,
    },
    {
        userAgent: 'Mozilla/5.0 (Linux; U; Android 2.3; zh-CN; MI-ONEPlus) AppleWebKit/534.13 (KHTML, like Gecko) UCBrowser/8.6.0.199 U3/0.8.0 Mobile Safari/534.13',
        expectedOs: OperatingSystem.Android,
    },
    {
        userAgent: 'Mozilla/5.0 (Linux; Android 9; SAMSUNG SM-G965F Build/PPR1.180610.011) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/9.0 Chrome/67.0.3396.87 Mobile Safari/537.36',
        expectedOs: OperatingSystem.Android,
    },
    {
        userAgent: 'Mozilla/5.0 (Linux; Android 8.0.0; SAMSUNG SM-G955U Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/8.2 Chrome/63.0.3239.111 Mobile Safari/537.36',
        expectedOs: OperatingSystem.Android,
    },
    {
        userAgent: 'Mozilla/5.0 (Linux; Android 7.0; SAMSUNG SM-J330FN Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/7.2 Chrome/59.0.3071.125 Mobile Safari/537.36',
        expectedOs: OperatingSystem.Android,
    },
    {
        userAgent: 'Mozilla/5.0 (Linux; Android 5.0.2; SAMSUNG SM-G925F Build/LRX22G) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/4.0 Chrome/44.0.2403.133 Mobile Safari/537.36',
        expectedOs: OperatingSystem.Android,
    },
    {
        userAgent: 'Mozilla/5.0 (Linux; Android 5.0.2; SAMSUNG SM-G925F Build/LRX22G) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/4.0 Chrome/44.0.2403.133 Mobile Safari/537.36',
        expectedOs: OperatingSystem.Android,
    },
    {
        userAgent: 'Mozilla/5.0 (Linux; U; Android 8.1.0; zh-cn; vivo X21A Build/OPM1.171019.011) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.132 MQQBrowser/9.1 Mobile Safari/537.36',
        expectedOs: OperatingSystem.Android,
    },
    {
        userAgent: 'Mozilla/5.0 (Linux; U; Android 4.4.2; zh-cn; GT-I9500 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko)Version/4.0 MQQBrowser/5.0 QQ-URL-Manager Mobile Safari/537.36',
        expectedOs: OperatingSystem.Android,
    },
    {
        userAgent: 'Mozilla/5.0 (Linux; Android 9; ONEPLUS A6003) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Mobile Safari/537.36',
        expectedOs: OperatingSystem.Android,
    },
    {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36',
        expectedOs: OperatingSystem.Windows,
    },
    {
        userAgent: 'Mozilla/5.0 (Windows NT 6.4; WOW64; rv:32.0) Gecko/20100101 Firefox/32.0',
        expectedOs: OperatingSystem.Windows,
    },
    {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_1_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Mobile/15E148 Safari/604.1',
        expectedOs: OperatingSystem.iOS,
    },
    {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36',
        expectedOs: OperatingSystem.macOS,
    },
    {
        userAgent: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:66.0) Gecko/20100101 Firefox/66.0',
        expectedOs: OperatingSystem.Linux,
    },
    {
        userAgent: 'Mozilla/5.0 (X11; CrOS x86_64 11316.165.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.122 Safari/537.36',
        expectedOs: OperatingSystem.ChromeOS,
    },
    {
        userAgent: 'Mozilla/5.0 (Mobile; LYF/F90M/LYF_F90M_000-03-12-110119; Android; rv:48.0) Gecko/48.0 Firefox/48.0 KAIOS/2.5',
        expectedOs: OperatingSystem.KaiOS,
    },
];
