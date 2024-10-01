import { OperatingSystem } from '@/domain/OperatingSystem';

export type SupportedOperatingSystem = OperatingSystem.Windows
| OperatingSystem.Linux
| OperatingSystem.macOS;

export const AllSupportedOperatingSystems: readonly (
  OperatingSystem & SupportedOperatingSystem
)[] = [
  OperatingSystem.Windows,
  OperatingSystem.Linux,
  OperatingSystem.macOS,
] as const;
