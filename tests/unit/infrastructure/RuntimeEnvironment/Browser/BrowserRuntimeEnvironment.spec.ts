import { describe, it, expect } from 'vitest';
import type { BrowserOsDetector } from '@/infrastructure/RuntimeEnvironment/Browser/BrowserOs/BrowserOsDetector';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { BrowserRuntimeEnvironment } from '@/infrastructure/RuntimeEnvironment/Browser/BrowserRuntimeEnvironment';
import { itEachAbsentObjectValue } from '@tests/unit/shared/TestCases/AbsentTests';
import { BrowserOsDetectorStub } from '@tests/unit/shared/Stubs/BrowserOsDetectorStub';
import type { IEnvironmentVariables } from '@/infrastructure/EnvironmentVariables/IEnvironmentVariables';
import { EnvironmentVariablesStub } from '@tests/unit/shared/Stubs/EnvironmentVariablesStub';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';

describe('BrowserRuntimeEnvironment', () => {
  describe('ctor', () => {
    describe('throws if window is absent', () => {
      itEachAbsentObjectValue((absentValue) => {
        // arrange
        const expectedError = 'missing window';
        const absentWindow = absentValue;
        // act
        const act = () => new BrowserRuntimeEnvironmentBuilder()
          .withWindow(absentWindow as never)
          .build();
        // assert
        expect(act).to.throw(expectedError);
      });
    });
    it('uses browser OS detector with current touch support', () => {
      // arrange
      const expectedTouchSupport = true;
      const osDetector = new BrowserOsDetectorStub();
      const window = { os: undefined, navigator: { userAgent: 'Forcing touch detection' } } as Partial<Window>;
      // act
      new BrowserRuntimeEnvironmentBuilder()
        .withWindow(window)
        .withBrowserOsDetector(osDetector)
        .withTouchSupported(expectedTouchSupport)
        .build();
      // assert
      const actualCall = osDetector.callHistory.find((c) => c.methodName === 'detect');
      expectExists(actualCall);
      const [{ isTouchSupported: actualTouchSupport }] = actualCall.args;
      expect(actualTouchSupport).to.equal(expectedTouchSupport);
    });
  });
  describe('isRunningAsDesktopApplication', () => {
    it('returns true when window property `isRunningAsDesktopApplication` is true', () => {
      // arrange
      const expectedValue = true;
      const desktopWindow: Partial<Window> = {
        isRunningAsDesktopApplication: true,
      };
      // act
      const sut = new BrowserRuntimeEnvironmentBuilder()
        .withWindow(desktopWindow)
        .build();
      // assert
      expect(sut.isRunningAsDesktopApplication).to.equal(expectedValue);
    });
    it('returns false when window property `isRunningAsDesktopApplication` is undefined', () => {
      // arrange
      const expectedValue = false;
      const browserWindow: Partial<Window> = {
        isRunningAsDesktopApplication: undefined,
      };
      // act
      const sut = new BrowserRuntimeEnvironmentBuilder()
        .withWindow(browserWindow)
        .build();
      // assert
      expect(sut.isRunningAsDesktopApplication).to.equal(expectedValue);
    });
  });
  describe('os', () => {
    it('returns undefined if user agent is missing', () => {
      // arrange
      const expected = undefined;
      const browserDetectorMock: BrowserOsDetector = {
        detect: () => {
          throw new Error('should not reach here');
        },
      };
      const sut = new BrowserRuntimeEnvironmentBuilder()
        .withBrowserOsDetector(browserDetectorMock)
        .build();
      // act
      const actual = sut.os;
      // assert
      expect(actual).to.equal(expected);
    });
    it('gets browser os from BrowserOsDetector', () => {
      // arrange
      const givenUserAgent = 'testUserAgent';
      const expected = OperatingSystem.macOS;
      const windowWithUserAgent = {
        navigator: {
          userAgent: givenUserAgent,
        },
      };
      const browserDetectorMock: BrowserOsDetector = {
        detect: (environment) => {
          if (environment.userAgent !== givenUserAgent) {
            throw new Error('Unexpected user agent');
          }
          return expected;
        },
      };
      // act
      const sut = new BrowserRuntimeEnvironmentBuilder()
        .withWindow(windowWithUserAgent as Partial<Window>)
        .withBrowserOsDetector(browserDetectorMock)
        .build();
      const actual = sut.os;
      // assert
      expect(actual).to.equal(expected);
    });
  });
  describe('isNonProduction', () => {
    [true, false].forEach((value) => {
      it(`sets ${value} from environment variables`, () => {
        // arrange
        const expectedValue = value;
        const environment = new EnvironmentVariablesStub()
          .withIsNonProduction(expectedValue);
        // act
        const sut = new BrowserRuntimeEnvironmentBuilder()
          .withEnvironmentVariables(environment)
          .build();
        // assert
        const actualValue = sut.isNonProduction;
        expect(actualValue).to.equal(expectedValue);
      });
    });
  });
});

class BrowserRuntimeEnvironmentBuilder {
  private window: Partial<Window> = {};

  private browserOsDetector: BrowserOsDetector = new BrowserOsDetectorStub();

  private environmentVariables: IEnvironmentVariables = new EnvironmentVariablesStub();

  private isTouchSupported = false;

  public withEnvironmentVariables(environmentVariables: IEnvironmentVariables): this {
    this.environmentVariables = environmentVariables;
    return this;
  }

  public withWindow(window: Partial<Window>): this {
    this.window = window;
    return this;
  }

  public withBrowserOsDetector(browserOsDetector: BrowserOsDetector): this {
    this.browserOsDetector = browserOsDetector;
    return this;
  }

  public withTouchSupported(isTouchSupported: boolean): this {
    this.isTouchSupported = isTouchSupported;
    return this;
  }

  public build() {
    return new BrowserRuntimeEnvironment(
      this.window,
      this.environmentVariables,
      this.browserOsDetector,
      () => this.isTouchSupported,
    );
  }
}
