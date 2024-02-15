import { OperatingSystem } from '@/domain/OperatingSystem';

export function getOperatingSystemDisplayName(os: OperatingSystem): string {
  const displayName = OperatingSystemNames[os];
  if (!displayName) {
    throw new RangeError(`Unsupported operating system ID: ${os}`);
  }
  return displayName;
}

const OperatingSystemNames: Partial<Record<OperatingSystem, string>> = {
  [OperatingSystem.Windows]: 'Windows',
  [OperatingSystem.macOS]: 'macOS',
  [OperatingSystem.Linux]: 'Linux',
};
