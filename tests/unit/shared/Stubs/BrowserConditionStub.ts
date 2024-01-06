import { OperatingSystem } from '@/domain/OperatingSystem';
import { BrowserCondition, TouchSupportExpectation } from '@/infrastructure/RuntimeEnvironment/Browser/BrowserOs/BrowserCondition';

export class BrowserConditionStub implements BrowserCondition {
  public operatingSystem: OperatingSystem = OperatingSystem.Android;

  public existingPartsInSameUserAgent: readonly string[] = [
    `[${BrowserConditionStub.name}] existing part`,
  ];

  public notExistingPartsInUserAgent?: readonly string[] = [
    `[${BrowserConditionStub.name}] non-existing part`,
  ];

  public touchSupport?: TouchSupportExpectation = undefined;

  public withOperatingSystem(operatingSystem: OperatingSystem): this {
    this.operatingSystem = operatingSystem;
    return this;
  }

  public withExistingPartsInSameUserAgent(existingPartsInSameUserAgent: readonly string[]): this {
    this.existingPartsInSameUserAgent = existingPartsInSameUserAgent;
    return this;
  }

  public withNotExistingPartsInUserAgent(notExistingPartsInUserAgent?: readonly string[]): this {
    this.notExistingPartsInUserAgent = notExistingPartsInUserAgent;
    return this;
  }

  public withTouchSupport(touchSupport?: TouchSupportExpectation): this {
    this.touchSupport = touchSupport;
    return this;
  }
}
