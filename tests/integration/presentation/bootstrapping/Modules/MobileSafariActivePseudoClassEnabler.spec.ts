import { describe, it, afterEach } from 'vitest';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { MobileSafariActivePseudoClassEnabler } from '@/presentation/bootstrapping/Modules/MobileSafariActivePseudoClassEnabler';
import { EventName, createWindowEventSpies } from '@tests/shared/Spies/WindowEventSpies';
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';
import { RuntimeEnvironment } from '@/infrastructure/RuntimeEnvironment/RuntimeEnvironment';
import { isTouchEnabledDevice } from '@/infrastructure/RuntimeEnvironment/TouchSupportDetection';
import { MobileSafariDetectionTestCases } from './MobileSafariDetectionTestCases';

describe('MobileSafariActivePseudoClassEnabler', () => {
  describe('bootstrap', () => {
    MobileSafariDetectionTestCases.forEach(({
      description, userAgent, supportsTouch, expectedResult,
    }) => {
      it(description, () => {
        // arrange
        const expectedEvent: EventName = 'touchstart';
        patchUserAgent(userAgent, afterEach);
        const { isAddEventCalled, currentListeners } = createWindowEventSpies(afterEach);
        const patchedEnvironment = new ConstructibleRuntimeEnvironment(supportsTouch);
        const sut = new MobileSafariActivePseudoClassEnabler(patchedEnvironment);
        // act
        sut.bootstrap();
        // assert
        const isSet = isAddEventCalled(expectedEvent);
        expect(isSet).to.equal(expectedResult, formatAssertionMessage([
          `Expected result\t\t: ${expectedResult ? 'true (mobile Safari)' : 'false (not mobile Safari)'}`,
          `Actual result\t\t: ${isSet ? 'true (mobile Safari)' : 'false (not mobile Safari)'}`,
          `User agent\t\t: ${navigator.userAgent}`,
          `Touch supported\t\t: ${supportsTouch}`,
          `Current OS\t\t: ${patchedEnvironment.os === undefined ? 'unknown' : OperatingSystem[patchedEnvironment.os]}`,
          `Is desktop?\t\t: ${patchedEnvironment.isDesktop ? 'Yes (Desktop app)' : 'No (Browser)'}`,
          `Listeners (${currentListeners.length})\t\t: ${JSON.stringify(currentListeners)}`,
        ]));
      });
    });
  });
});

function patchUserAgent(
  userAgent: string,
  restoreCallback: (restoreFunc: () => void) => void,
) {
  const originalNavigator = window.navigator;
  const userAgentGetter = { get: () => userAgent };
  window.navigator = Object.create(navigator, {
    userAgent: userAgentGetter,
  });
  restoreCallback(() => {
    Object.assign(window, {
      navigator: originalNavigator,
    });
  });
}

function getTouchDetectorMock(
  isTouchEnabled: boolean,
): typeof isTouchEnabledDevice {
  return () => isTouchEnabled;
}

class ConstructibleRuntimeEnvironment extends RuntimeEnvironment {
  public constructor(isTouchEnabled: boolean) {
    super(window, undefined, undefined, getTouchDetectorMock(isTouchEnabled));
  }
}
