import { OperatingSystem } from '@/domain/OperatingSystem';

export enum TouchSupportExpectation {
  MustExist,
  MustNotExist,
}

export interface BrowserCondition {
  readonly operatingSystem: OperatingSystem;

  readonly existingPartsInSameUserAgent: readonly string[];

  readonly notExistingPartsInUserAgent?: readonly string[];

  readonly touchSupport?: TouchSupportExpectation;
}
