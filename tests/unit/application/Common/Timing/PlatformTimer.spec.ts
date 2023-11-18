import {
  describe, it, expect, beforeEach,
  afterEach,
} from 'vitest';
import { PlatformTimer } from '@/application/Common/Timing/PlatformTimer';

describe('PlatformTimer', () => {
  let originalSetTimeout: typeof global.setTimeout;
  let originalClearTimeout: typeof global.clearTimeout;
  let originalDateNow: typeof global.Date.now;

  beforeEach(() => {
    originalSetTimeout = global.setTimeout;
    originalClearTimeout = global.clearTimeout;
    originalDateNow = Date.now;
    Date.now = () => originalDateNow();
  });

  afterEach(() => {
    global.setTimeout = originalSetTimeout;
    global.clearTimeout = originalClearTimeout;
    Date.now = originalDateNow;
  });

  describe('setTimeout', () => {
    it('calls the global setTimeout with the provided delay', () => {
      // arrange
      const expectedDelay = 55;
      let actualDelay: number | undefined;
      global.setTimeout = ((_, delay) => {
        actualDelay = delay;
      }) as typeof global.setTimeout;
      // act
      PlatformTimer.setTimeout(() => { /* NOOP */ }, expectedDelay);
      // assert
      expect(actualDelay).to.equal(expectedDelay);
    });
    it('calls the global setTimeout with the provided callback', () => {
      // arrange
      const expectedCallback = () => { /* NOOP */ };
      let actualCallback: typeof expectedCallback | undefined;
      global.setTimeout = ((callback) => {
        actualCallback = callback;
      }) as typeof global.setTimeout;
      // act
      PlatformTimer.setTimeout(expectedCallback, 33);
      // assert
      expect(actualCallback).to.equal(expectedCallback);
    });
  });

  describe('clearTimeout', () => {
    it('should clear timeout', () => {
      // arrange
      let actualTimer: ReturnType<typeof PlatformTimer.setTimeout> | undefined;
      global.clearTimeout = ((timer) => {
        actualTimer = timer;
      }) as typeof global.clearTimeout;
      const expectedTimer = PlatformTimer.setTimeout(() => { /* NOOP */ }, 1);
      // act
      PlatformTimer.clearTimeout(expectedTimer);
      // assert
      expect(actualTimer).to.equal(expectedTimer);
    });
  });

  describe('dateNow', () => {
    it('should get current date', () => {
      // arrange
      const expected = Date.now();
      Date.now = () => expected;
      // act
      const actual = PlatformTimer.dateNow();
      // assert
      expect(expected).to.equal(actual);
    });
  });
});
