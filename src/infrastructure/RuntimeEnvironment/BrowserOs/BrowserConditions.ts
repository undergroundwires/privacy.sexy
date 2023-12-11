import { OperatingSystem } from '@/domain/OperatingSystem';
import { BrowserCondition, TouchSupportExpectation } from './BrowserCondition';

// They include "Android", "iPhone" in their user agents.
const WindowsMobileIdentifiers: readonly string[] = [
  'Windows Phone',
  'Windows Mobile',
] as const;

export const BrowserConditions: readonly BrowserCondition[] = [
  {
    operatingSystem: OperatingSystem.KaiOS,
    existingPartsInSameUserAgent: ['KAIOS'],
  },
  {
    operatingSystem: OperatingSystem.ChromeOS,
    existingPartsInSameUserAgent: ['CrOS'],
  },
  {
    operatingSystem: OperatingSystem.BlackBerryOS,
    existingPartsInSameUserAgent: ['BlackBerry'],
  },
  {
    operatingSystem: OperatingSystem.BlackBerryTabletOS,
    existingPartsInSameUserAgent: ['RIM Tablet OS'],
  },
  {
    operatingSystem: OperatingSystem.BlackBerry10,
    existingPartsInSameUserAgent: ['BB10'],
  },
  {
    operatingSystem: OperatingSystem.Android,
    existingPartsInSameUserAgent: ['Android'],
    notExistingPartsInUserAgent: [...WindowsMobileIdentifiers],
  },
  {
    operatingSystem: OperatingSystem.Android,
    existingPartsInSameUserAgent: ['Adr'],
    notExistingPartsInUserAgent: [...WindowsMobileIdentifiers],
  },
  {
    operatingSystem: OperatingSystem.iOS,
    existingPartsInSameUserAgent: ['iPhone'],
    notExistingPartsInUserAgent: [...WindowsMobileIdentifiers],
  },
  {
    operatingSystem: OperatingSystem.iOS,
    existingPartsInSameUserAgent: ['iPod'],
  },
  {
    operatingSystem: OperatingSystem.iPadOS,
    existingPartsInSameUserAgent: ['iPad'],
    // On Safari, only for older iPads running ≤ iOS 12 reports `iPad`
    // Other browsers report `iPad` both for older devices (≤ iOS 12) and newer (≥ iPadOS 13)
    // We detect all as `iPadOS` for simplicity.
  },
  {
    operatingSystem: OperatingSystem.iPadOS,
    existingPartsInSameUserAgent: ['Macintosh'], // Reported by Safari on iPads running ≥ iPadOS 13
    touchSupport: TouchSupportExpectation.MustExist, // Safari same user agent as desktop macOS
  },
  {
    operatingSystem: OperatingSystem.Linux,
    existingPartsInSameUserAgent: ['Linux'],
    notExistingPartsInUserAgent: ['Android', 'Adr'],
  },
  {
    operatingSystem: OperatingSystem.Windows,
    existingPartsInSameUserAgent: ['Windows'],
    notExistingPartsInUserAgent: [...WindowsMobileIdentifiers],
  },
  ...['Windows Phone OS', 'Windows Phone 8'].map((userAgentPart) => ({
    operatingSystem: OperatingSystem.WindowsPhone,
    existingPartsInSameUserAgent: [userAgentPart],
  })),
  ...['Windows Mobile', 'Windows Phone 10'].map((userAgentPart) => ({
    operatingSystem: OperatingSystem.Windows10Mobile,
    existingPartsInSameUserAgent: [userAgentPart],
  })),
  {
    operatingSystem: OperatingSystem.macOS,
    existingPartsInSameUserAgent: ['Macintosh'],
    notExistingPartsInUserAgent: ['like Mac OS X'], // Eliminate iOS and iPadOS for Safari
    touchSupport: TouchSupportExpectation.MustNotExist, // Distinguish from iPadOS for Safari
  },
] as const;
