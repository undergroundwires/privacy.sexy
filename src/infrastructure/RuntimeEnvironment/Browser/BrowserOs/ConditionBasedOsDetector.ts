import { OperatingSystem } from '@/domain/OperatingSystem';
import { assertInRange } from '@/application/Common/Enum';
import { type BrowserCondition, TouchSupportExpectation } from './BrowserCondition';
import { BrowserConditions } from './BrowserConditions';
import type { BrowserEnvironment, BrowserOsDetector } from './BrowserOsDetector';

export class ConditionBasedOsDetector implements BrowserOsDetector {
  constructor(private readonly conditions: readonly BrowserCondition[] = BrowserConditions) {
    validateConditions(conditions);
  }

  public detect(environment: BrowserEnvironment): OperatingSystem | undefined {
    if (!environment.userAgent) {
      return undefined;
    }
    for (const condition of this.conditions) {
      if (satisfiesCondition(condition, environment)) {
        return condition.operatingSystem;
      }
    }
    return undefined;
  }
}

function satisfiesCondition(
  condition: BrowserCondition,
  browserEnvironment: BrowserEnvironment,
): boolean {
  const { userAgent } = browserEnvironment;
  if (condition.touchSupport !== undefined) {
    if (!satisfiesTouchExpectation(condition.touchSupport, browserEnvironment)) {
      return false;
    }
  }
  if (condition.existingPartsInSameUserAgent.some((part) => !userAgent.includes(part))) {
    return false;
  }
  if (condition.notExistingPartsInUserAgent?.some((part) => userAgent.includes(part))) {
    return false;
  }
  return true;
}

function satisfiesTouchExpectation(
  expectation: TouchSupportExpectation,
  browserEnvironment: BrowserEnvironment,
): boolean {
  switch (expectation) {
    case TouchSupportExpectation.MustExist:
      if (!browserEnvironment.isTouchSupported) {
        return false;
      }
      break;
    case TouchSupportExpectation.MustNotExist:
      if (browserEnvironment.isTouchSupported) {
        return false;
      }
      break;
    default:
      throw new Error(`Unsupported touch support expectation: ${TouchSupportExpectation[expectation]}`);
  }
  return true;
}

function validateConditions(conditions: readonly BrowserCondition[]) {
  if (!conditions.length) {
    throw new Error('empty conditions');
  }
  for (const condition of conditions) {
    validateCondition(condition);
  }
}

function validateCondition(condition: BrowserCondition) {
  if (!condition.existingPartsInSameUserAgent.length) {
    throw new Error('Each condition must include at least one identifiable part of the user agent string.');
  }
  const duplicates = getDuplicates([
    ...condition.existingPartsInSameUserAgent,
    ...(condition.notExistingPartsInUserAgent ?? []),
  ]);
  if (duplicates.length > 0) {
    throw new Error(`Found duplicate entries in user agent parts: ${duplicates.join(', ')}. Each part should be unique.`);
  }
  if (condition.touchSupport !== undefined) {
    assertInRange(condition.touchSupport, TouchSupportExpectation);
  }
}

function getDuplicates(texts: readonly string[]): string[] {
  return texts.filter((text, index) => texts.indexOf(text) !== index);
}
