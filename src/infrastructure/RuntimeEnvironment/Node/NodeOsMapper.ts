import { OperatingSystem } from '@/domain/OperatingSystem';

export function convertPlatformToOs(
  platform: NodeJS.Platform,
): OperatingSystem | undefined {
  switch (platform) {
    case 'darwin':
      return OperatingSystem.macOS;
    case 'win32':
      return OperatingSystem.Windows;
    case 'linux':
      return OperatingSystem.Linux;
    default:
      return undefined;
  }
}
