import { describe, it, expect } from 'vitest';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { ConditionBasedOsDetector } from '@/infrastructure/RuntimeEnvironment/Browser/BrowserOs/ConditionBasedOsDetector';
import type { BrowserEnvironment } from '@/infrastructure/RuntimeEnvironment/Browser/BrowserOs/BrowserOsDetector';
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';
import { BrowserOsTestCases } from './BrowserOsTestCases';

describe('ConditionBasedOsDetector', () => {
  describe('detect', () => {
    it('detects as expected', () => {
      BrowserOsTestCases.forEach((testCase) => {
        // arrange
        const sut = new ConditionBasedOsDetector();
        const environment: BrowserEnvironment = {
          userAgent: testCase.userAgent,
          isTouchSupported: testCase.platformTouchSupport,
        };
        // act
        const actual = sut.detect(environment);
        // assert
        expect(actual).to.equal(testCase.expectedOs, formatAssertionMessage([
          `Expected: "${OperatingSystem[testCase.expectedOs]}"`,
          `Actual: "${actual === undefined ? 'undefined' : OperatingSystem[actual]}"`,
          `User agent: "${testCase.userAgent}"`,
          `Touch support: "${testCase.platformTouchSupport ? 'Yes, supported' : 'No, unsupported.'}"`,
        ]));
      });
    });
  });
});
