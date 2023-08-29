import { describe, it, expect } from 'vitest';
import { IBrowserOsDetector } from '@/infrastructure/RuntimeEnvironment/BrowserOs/IBrowserOsDetector';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { RuntimeEnvironment } from '@/infrastructure/RuntimeEnvironment/RuntimeEnvironment';
import { itEachAbsentObjectValue } from '@tests/unit/shared/TestCases/AbsentTests';
import { BrowserOsDetectorStub } from '@tests/unit/shared/Stubs/BrowserOsDetectorStub';
import { IEnvironmentVariables } from '@/infrastructure/EnvironmentVariables/IEnvironmentVariables';
import { EnvironmentVariablesStub } from '@tests/unit/shared/Stubs/EnvironmentVariablesStub';

describe('RuntimeEnvironment', () => {
  describe('ctor', () => {
    describe('throws if window is absent', () => {
      itEachAbsentObjectValue((absentValue) => {
        // arrange
        const expectedError = 'missing window';
        const absentWindow = absentValue;
        // act
        const act = () => createEnvironment({
          window: absentWindow,
        });
        // assert
        expect(act).to.throw(expectedError);
      });
    });
  });
  describe('isDesktop', () => {
    it('returns true when window property isDesktop is true', () => {
      // arrange
      const desktopWindow = {
        isDesktop: true,
      };
      // act
      const sut = createEnvironment({
        window: desktopWindow,
      });
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
      const sut = createEnvironment({
        window: browserWindow,
      });
      // assert
      expect(sut.isDesktop).to.equal(expectedValue);
    });
  });
  describe('os', () => {
    it('returns undefined if user agent is missing', () => {
      // arrange
      const expected = undefined;
      const browserDetectorMock: IBrowserOsDetector = {
        detect: () => {
          throw new Error('should not reach here');
        },
      };
      const sut = createEnvironment({
        browserOsDetector: browserDetectorMock,
      });
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
      const browserDetectorMock: IBrowserOsDetector = {
        detect: (agent) => {
          if (agent !== givenUserAgent) {
            throw new Error('Unexpected user agent');
          }
          return expected;
        },
      };
      // act
      const sut = createEnvironment({
        window: windowWithUserAgent as Partial<Window>,
        browserOsDetector: browserDetectorMock,
      });
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
            const sut = createEnvironment({
              window: desktopWindowWithOs,
            });
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
            os: absentValue,
          };
          // act
          const sut = createEnvironment({
            window: windowWithAbsentOs,
          });
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
        const sut = createEnvironment({
          environmentVariables: environment,
        });
        // assert
        const actualValue = sut.isNonProduction;
        expect(actualValue).to.equal(expectedValue);
      });
    });
  });
});

interface EnvironmentOptions {
  window: Partial<Window>;
  browserOsDetector?: IBrowserOsDetector;
  environmentVariables?: IEnvironmentVariables;
}

function createEnvironment(options: Partial<EnvironmentOptions> = {}): TestableRuntimeEnvironment {
  const defaultOptions: EnvironmentOptions = {
    window: {},
    browserOsDetector: new BrowserOsDetectorStub(),
    environmentVariables: new EnvironmentVariablesStub(),
  };

  return new TestableRuntimeEnvironment({ ...defaultOptions, ...options });
}

class TestableRuntimeEnvironment extends RuntimeEnvironment {
  public constructor(options: EnvironmentOptions) {
    super(options.window, options.environmentVariables, options.browserOsDetector);
  }
}
