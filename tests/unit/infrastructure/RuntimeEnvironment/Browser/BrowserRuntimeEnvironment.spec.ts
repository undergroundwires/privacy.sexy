// eslint-disable-next-line max-classes-per-file
import { describe, it, expect } from 'vitest';
import { BrowserOsDetector } from '@/infrastructure/RuntimeEnvironment/Browser/BrowserOs/BrowserOsDetector';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { BrowserRuntimeEnvironment } from '@/infrastructure/RuntimeEnvironment/Browser/BrowserRuntimeEnvironment';
import { itEachAbsentObjectValue } from '@tests/unit/shared/TestCases/AbsentTests';
import { BrowserOsDetectorStub } from '@tests/unit/shared/Stubs/BrowserOsDetectorStub';
import { IEnvironmentVariables } from '@/infrastructure/EnvironmentVariables/IEnvironmentVariables';
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
  describe('isDesktop', () => {
    it('returns true when window property isDesktop is true', () => {
      // arrange
      const desktopWindow = {
        isDesktop: true,
      };
      // act
      const sut = new BrowserRuntimeEnvironmentBuilder()
        .withWindow(desktopWindow)
        .build();
      // assert
      expect(sut.isDesktop).to.equal(true);
    });
    it('returns false when window property isDesktop is false', () => {
      // arrange
      const expectedValue = false;
      const browserWindow = {
        isDesktop: false,
      };
      // act
      const sut = new BrowserRuntimeEnvironmentBuilder()
        .withWindow(browserWindow)
        .build();
      // assert
      expect(sut.isDesktop).to.equal(expectedValue);
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
    describe('desktop os', () => {
      describe('returns from window property `os`', () => {
        const testValues = [
          OperatingSystem.macOS,
          OperatingSystem.Windows,
          OperatingSystem.Linux,
        ];
        testValues.forEach((testValue) => {
          it(`given ${OperatingSystem[testValue]}`, () => {
            // arrange
            const expectedOs = testValue;
            const desktopWindowWithOs = {
              isDesktop: true,
              os: expectedOs,
            };
            // act
            const sut = new BrowserRuntimeEnvironmentBuilder()
              .withWindow(desktopWindowWithOs)
              .build();
            // assert
            const actualOs = sut.os;
            expect(actualOs).to.equal(expectedOs);
          });
        });
      });
      describe('returns undefined when window property `os` is absent', () => {
        itEachAbsentObjectValue((absentValue) => {
          // arrange
          const expectedValue = undefined;
          const windowWithAbsentOs = {
            os: absentValue as never,
          };
          // act
          const sut = new BrowserRuntimeEnvironmentBuilder()
            .withWindow(windowWithAbsentOs)
            .build();
          // assert
          expect(sut.os).to.equal(expectedValue);
        });
      });
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
