import { describe, it, expect } from 'vitest';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { BrowserOsDetector } from '@/infrastructure/RuntimeEnvironment/BrowserOs/BrowserOsDetector';
import { itEachAbsentStringValue } from '@tests/unit/shared/TestCases/AbsentTests';
import { BrowserOsTestCases } from './BrowserOsTestCases';

describe('BrowserOsDetector', () => {
  describe('returns undefined when user agent is absent', () => {
    itEachAbsentStringValue((absentValue) => {
      // arrange
      const expected = undefined;
      const userAgent = absentValue;
      const sut = new BrowserOsDetector();
      // act
      const actual = sut.detect(userAgent);
      // assert
      expect(actual).to.equal(expected);
    });
  });
  it('detects as expected', () => {
    BrowserOsTestCases.forEach((testCase) => {
      // arrange
      const sut = new BrowserOsDetector();
      // act
      const actual = sut.detect(testCase.userAgent);
      // assert
      expect(actual).to.equal(testCase.expectedOs, printMessage());
      function printMessage(): string {
        return `Expected: "${OperatingSystem[testCase.expectedOs]}"\n`
          + `Actual: "${OperatingSystem[actual]}"\n`
          + `UserAgent: "${testCase.userAgent}"`;
      }
    });
  });
});
