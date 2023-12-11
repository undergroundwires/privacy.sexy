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
  windowTouchEvent: () => undefined | unknown;
}

const TouchSupportChecks: ReadonlyArray<(accessor: BrowserTouchSupportAccessor) => boolean> = [
  /*
    ✅ Mobile: Chrome, Safari, Firefox on iOS and Android
    ❌ Touch-enabled Windows laptop: Chrome
      (Chromium has removed ontouch* events on desktop since Chrome 70+.)
    ❌ Touch-enabled Windows laptop: Firefox
  */
  (accessor) => accessor.documentOntouchend() !== undefined,
  /*
    ✅ Mobile: Chrome, Safari, Firefox on iOS and Android
    ✅ Touch-enabled Windows laptop: Chrome
    ❌ Touch-enabled Windows laptop: Firefox
  */
  (accessor) => {
    const maxTouchPoints = accessor.navigatorMaxTouchPoints();
    return maxTouchPoints !== undefined && maxTouchPoints > 0;
  },
  /*
    ✅ Mobile: Chrome, Safari, Firefox on iOS and Android
    ✅ Touch-enabled Windows laptop: Chrome
    ❌ Touch-enabled Windows laptop: Firefox
  */
  (accessor) => accessor.windowMatchMediaMatches('(any-pointer: coarse)'),
  /*
    ✅ Mobile: Chrome, Safari, Firefox on iOS and Android
    ✅ Touch-enabled Windows laptop: Chrome
    ❌ Touch-enabled Windows laptop: Firefox
  */
  (accessor) => accessor.windowTouchEvent() !== undefined,
];

const GlobalTouchSupportAccessor: BrowserTouchSupportAccessor = {
  navigatorMaxTouchPoints: () => navigator.maxTouchPoints,
  windowMatchMediaMatches: (query: string) => window.matchMedia(query)?.matches,
  documentOntouchend: () => document.ontouchend,
  windowTouchEvent: () => window.TouchEvent,
} as const;
