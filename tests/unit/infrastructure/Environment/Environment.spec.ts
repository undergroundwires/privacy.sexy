import { describe, it, expect } from 'vitest';
import { IBrowserOsDetector } from '@/infrastructure/Environment/BrowserOs/IBrowserOsDetector';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { Environment, WindowValidator } from '@/infrastructure/Environment/Environment';
import { SystemOperationsStub } from '@tests/unit/shared/Stubs/SystemOperationsStub';
import { itEachAbsentObjectValue } from '@tests/unit/shared/TestCases/AbsentTests';
import { WindowVariables } from '@/infrastructure/Environment/WindowVariables';
import { BrowserOsDetectorStub } from '@tests/unit/shared/Stubs/BrowserOsDetectorStub';

describe('Environment', () => {
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
  describe('system', () => {
    it('fetches system operations from window', () => {
      // arrange
      const expectedSystem = new SystemOperationsStub();
      const windowWithSystem = {
        system: expectedSystem,
      };
      // act
      const sut = createEnvironment({
        window: windowWithSystem,
      });
      // assert
      const actualSystem = sut.system;
      expect(actualSystem).to.equal(expectedSystem);
    });
  });
  describe('validateWindow', () => {
    it('throws when validator throws', () => {
      // arrange
      const expectedErrorMessage = 'expected error thrown from window validator';
      const mockValidator: WindowValidator = () => {
        throw new Error(expectedErrorMessage);
      };
      // act
      const act = () => createEnvironment({
        windowValidator: mockValidator,
      });
      // assert
      expect(act).to.throw(expectedErrorMessage);
    });
    it('does not throw when validator does not throw', () => {
      // arrange
      const expectedErrorMessage = 'expected error thrown from window validator';
      const mockValidator: WindowValidator = () => {
        // do not throw
      };
      // act
      const act = () => createEnvironment({
        windowValidator: mockValidator,
      });
      // assert
      expect(act).to.not.throw(expectedErrorMessage);
    });
    it('sends expected window to validator', () => {
      // arrange
      const expectedVariables: Partial<WindowVariables> = {};
      let actualVariables: Partial<WindowVariables>;
      const mockValidator: WindowValidator = (variables) => {
        actualVariables = variables;
      };
      // act
      createEnvironment({
        window: expectedVariables,
        windowValidator: mockValidator,
      });
      // assert
      expect(actualVariables).to.equal(expectedVariables);
    });
  });
});

interface EnvironmentOptions {
  window: Partial<Window>;
  browserOsDetector?: IBrowserOsDetector;
  windowValidator?: WindowValidator;
}

function createEnvironment(options: Partial<EnvironmentOptions> = {}): TestableEnvironment {
  const defaultOptions: EnvironmentOptions = {
    window: {},
    browserOsDetector: new BrowserOsDetectorStub(),
    windowValidator: () => { /* NO OP */ },
  };

  return new TestableEnvironment({ ...defaultOptions, ...options });
}

class TestableEnvironment extends Environment {
  public constructor(options: EnvironmentOptions) {
    super(options.window, options.browserOsDetector, options.windowValidator);
  }
}
