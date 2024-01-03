export function isTouchEnabledDevice(
  browserTouchAccessor: BrowserTouchSupportAccessor = GlobalTouchSupportAccessor,
): boolean {
  return TouchSupportChecks.some(
    (check) => check(browserTouchAccessor),
  );
}

export interface BrowserTouchSupportAccessor {
  navigatorMaxTouchPoints: () => number | undefined;
  windowMatchMediaMatches: (query: string) => boolean;
  documentOntouchend: () => undefined | unknown;
}

/*
  Touch support checks are inconsistent across different browsers and OS.
  `✅` and `❌` indicate correct and incorrect detections, respectively.
*/
const TouchSupportChecks: ReadonlyArray<(accessor: BrowserTouchSupportAccessor) => boolean> = [
  /*
    Mobile (iOS & Android): ✅ Chrome, ✅ Safari, ✅ Firefox
    Touch-enabled Windows laptop: ❌ Chrome (reports no touch), ❌ Firefox (reports no touch)
      Chromium has removed ontouch* events on desktop since Chrome 70+
    Non-touch macOS: ✅ Firefox, ✅ Safari, ✅ Chromium
  */
  (accessor) => accessor.documentOntouchend() !== undefined,
  /*
    Mobile (iOS & Android): ✅ Chrome, ✅ Safari, ✅ Firefox
    Touch-enabled Windows laptop: ✅ Chrome, ❌ Firefox (reports no touch)
    Non-touch macOS: ✅ Firefox, ✅ Safari, ✅ Chromium
  */
  (accessor) => {
    const maxTouchPoints = accessor.navigatorMaxTouchPoints();
    return maxTouchPoints !== undefined && maxTouchPoints > 0;
  },
  /*
    Mobile (iOS & Android): ✅ Chrome, ✅ Safari, ✅ Firefox
    Touch-enabled Windows laptop: ✅ Chrome, ❌ Firefox (reports no touch)
    Non-touch macOS: ✅ Firefox, ✅ Safari, ✅ Chromium
  */
  (accessor) => accessor.windowMatchMediaMatches('(any-pointer: coarse)'),

  /*
    Do not check window.TouchEvent === undefined, as it incorrectly
    reports touch support on Chromium macOS even though there is no
    touch support.
      Mobile (iOS & Android): ✅ Chrome, ✅ Safari, ✅ Firefox
      Touch-enabled Windows laptop: ✅ Chrome, ❌ Firefox (reports no touch)
      Non-touch macOS: ✅ Firefox, ✅ Safari, ❌ Chromium (reports touch)
  */
];

const GlobalTouchSupportAccessor: BrowserTouchSupportAccessor = {
  navigatorMaxTouchPoints: () => navigator.maxTouchPoints,
  windowMatchMediaMatches: (query: string) => window.matchMedia(query)?.matches,
  documentOntouchend: () => document.ontouchend,
} as const;
